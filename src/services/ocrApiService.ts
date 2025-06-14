
import { OCRApiResponse, ExtractedData } from '@/types/ocrTypes';
import { PatientInfoExtractor } from './patientInfoExtractor';
import { ParameterExtractor } from './parameterExtractor';

export class OCRApiService {
  private apiKey: string = '';
  private apiUrl: string = 'https://api.ocr.space/parse/image';

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }

  async extractTextFromFile(file: File): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OCR API key not provided. Please set your API key first.');
    }

    try {
      console.log('Starting OCR API extraction for file:', file.name);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('apikey', this.apiKey);
      formData.append('language', 'eng');
      formData.append('isOverlayRequired', 'true');
      formData.append('detectOrientation', 'true');
      formData.append('isTable', 'true');
      formData.append('scale', 'true');
      formData.append('OCREngine', '2');
      formData.append('isSearchablePdfHideTextLayer', 'false');
      
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`OCR API request failed: ${response.status}`);
      }

      const result: OCRApiResponse = await response.json();
      
      if (result.IsErroredOnProcessing) {
        throw new Error(`OCR processing failed: ${result.ParsedResults?.[0]?.ErrorMessage || 'Unknown error'}`);
      }

      if (!result.ParsedResults || result.ParsedResults.length === 0) {
        throw new Error('No text extracted from the image');
      }

      const extractedText = result.ParsedResults[0].ParsedText;
      console.log('OCR API extraction completed. Text length:', extractedText.length);
      
      return extractedText;
    } catch (error) {
      console.error('OCR API extraction failed:', error);
      throw new Error(`Failed to extract text from image: ${error.message}`);
    }
  }

  parseLabReport(extractedText: string): ExtractedData {
    console.log('Parsing lab report text...');
    
    // Extract patient information
    const patientInfo = PatientInfoExtractor.extractPatientInfo(extractedText);
    
    // Extract lab parameters
    const parameters = ParameterExtractor.extractParameters(extractedText);
    
    return {
      patientInfo,
      parameters
    };
  }
}

export const ocrApiService = new OCRApiService();
