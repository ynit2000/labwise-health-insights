
import { OCRApiResponse, ExtractedData } from '@/types/ocrTypes';
import { PatientInfoExtractor } from './patientInfoExtractor';
import { ParameterExtractor } from './parameterExtractor';

const PRIMARY_OCR_API_KEY = "K88990872588957";
const SECONDARY_OCR_API_KEY = "K88904862588957";

export class OCRApiService {
  private apiKey: string = '';
  private apiUrl: string = 'https://api.ocr.space/parse/image';
  private maxRetries: number = 3;
  private retryDelay: number = 2000; // 2 seconds

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async validateApiKey(apiKey: string): Promise<{ isValid: boolean; error?: string }> {
    try {
      console.log('Validating OCR API key...');
      
      // Create a simple test image (1x1 pixel base64 image)
      const testImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      
      const formData = new FormData();
      formData.append('base64Image', testImageBase64);
      formData.append('apikey', apiKey);
      formData.append('language', 'eng');
      formData.append('isOverlayRequired', 'false');
      
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        body: formData
      });
      
      if (response.status === 403) {
        const errorText = await response.text();
        console.error('API key validation failed:', errorText);
        return { 
          isValid: false, 
          error: 'Invalid API key or access denied. Please check your OCR.space API key.' 
        };
      }
      
      if (response.status === 401) {
        return { 
          isValid: false, 
          error: 'Unauthorized. Please check your OCR.space API key.' 
        };
      }
      
      if (!response.ok) {
        return { 
          isValid: false, 
          error: `API validation failed: ${response.status} - ${response.statusText}` 
        };
      }
      
      const result = await response.json();
      
      if (result.IsErroredOnProcessing) {
        const errorMessage = result.ParsedResults?.[0]?.ErrorMessage;
        if (errorMessage && errorMessage.includes('Invalid API key')) {
          return { 
            isValid: false, 
            error: 'Invalid API key. Please check your OCR.space API key.' 
          };
        }
      }
      
      console.log('API key validation successful');
      return { isValid: true };
      
    } catch (error) {
      console.error('API key validation error:', error);
      return { 
        isValid: false, 
        error: `Validation failed: ${error.message}` 
      };
    }
  }

  private async makeOCRRequest(formData: FormData, attempt: number = 1): Promise<OCRApiResponse> {
    console.log(`OCR API attempt ${attempt}/${this.maxRetries}`);
    
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      body: formData
    });

    if (response.status === 403) {
      const errorText = await response.text();
      console.error('OCR API 403 error:', errorText);
      
      if (errorText.includes('concurrent connections') && attempt < this.maxRetries) {
        console.log(`Rate limited, retrying in ${this.retryDelay}ms...`);
        await this.delay(this.retryDelay * attempt); // Exponential backoff
        return this.makeOCRRequest(formData, attempt + 1);
      }
      
      throw new Error(`OCR API access denied (403). This could be due to: 1) Invalid API key, 2) Exceeded concurrent connections limit, 3) API quota exceeded. Please check your API key and try again later.`);
    }

    if (!response.ok) {
      throw new Error(`OCR API request failed: ${response.status} - ${response.statusText}`);
    }

    return await response.json();
  }

  async extractTextFromFile(file: File): Promise<string> {
    // Determine what API key to use:
    let apiKeyToTry = this.apiKey || PRIMARY_OCR_API_KEY;
    let triedSecondary = false;

    // Validate file size (OCR.space has limits)
    const maxFileSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxFileSize) {
      throw new Error('File too large. Please use a file smaller than 5MB for better OCR processing.');
    }

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        console.log('Starting OCR API extraction for file:', file.name, 'Size:', Math.round(file.size / 1024), 'KB');
        const formData = new FormData();
        formData.append('file', file);
        formData.append('apikey', apiKeyToTry);
        formData.append('language', 'eng');
        formData.append('isOverlayRequired', 'false');
        formData.append('detectOrientation', 'true');
        formData.append('isTable', 'true');
        formData.append('scale', 'true');
        formData.append('OCREngine', '2');

        const result = await this.makeOCRRequest(formData);

        if (result.IsErroredOnProcessing) {
          const errorMessage = result.ParsedResults?.[0]?.ErrorMessage || 'Unknown OCR processing error';
          // OCR.space returns a specific message for invalid/quota key:
          if (
            !triedSecondary &&
            (errorMessage.includes('Invalid API key') ||
              errorMessage.includes('quota') ||
              errorMessage.includes('API key'))
          ) {
            apiKeyToTry = SECONDARY_OCR_API_KEY;
            triedSecondary = true;
            console.warn("Primary OCR key failed, retrying with secondary OCR key...");
            continue;
          }
          throw new Error(`OCR processing failed: ${errorMessage}`);
        }

        if (!result.ParsedResults || result.ParsedResults.length === 0) {
          throw new Error('No text could be extracted from the image. Please ensure the image is clear and contains readable text.');
        }

        const extractedText = result.ParsedResults[0].ParsedText;
        console.log('OCR API extraction completed successfully. Text length:', extractedText.length);

        if (extractedText.trim().length < 10) {
          throw new Error('Very little text was extracted. Please ensure the image is clear and contains readable text.');
        }

        return extractedText;
      } catch (error: any) {
        lastError = error;
        // Only swap key if the error is definitely related to the API key or quota and not already tried secondary
        if (
          !triedSecondary &&
          (error.message?.includes('403') ||
            error.message?.toLowerCase()?.includes('api key') ||
            error.message?.toLowerCase()?.includes('quota'))
        ) {
          apiKeyToTry = SECONDARY_OCR_API_KEY;
          triedSecondary = true;
          console.warn("Primary OCR key failed, retrying with secondary OCR key...");
          continue;
        }
        break;
      }
    }

    // Fallback: if still failed after retrying second key
    if (lastError) {
      if (
        lastError.message?.includes('403') ||
        lastError.message?.toLowerCase()?.includes('api key') ||
        lastError.message?.toLowerCase()?.includes('quota')
      ) {
        throw new Error('Both primary and secondary OCR API keys failed. Please check your API key or try again later.');
      }
      throw new Error(`Failed to extract text from image: ${lastError.message}`);
    }
    throw new Error('Unknown error during OCR extraction.');
  }

  parseLabReport(extractedText: string): ExtractedData {
    console.log('Parsing lab report text...');
    
    try {
      // Extract patient information
      const patientInfo = PatientInfoExtractor.extractPatientInfo(extractedText);
      
      // Extract lab parameters
      const parameters = ParameterExtractor.extractParameters(extractedText);
      
      console.log('Lab report parsing completed:', {
        patientInfoFound: !!patientInfo.name,
        parametersCount: parameters.length
      });
      
      return {
        patientInfo,
        parameters
      };
    } catch (error) {
      console.error('Lab report parsing failed:', error);
      throw new Error(`Failed to parse lab report: ${error.message}`);
    }
  }
}

export const ocrApiService = new OCRApiService();

