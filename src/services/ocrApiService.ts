
interface OCRApiResponse {
  ParsedResults: Array<{
    TextOverlay: {
      Lines: Array<{
        LineText: string;
        Words: Array<{
          WordText: string;
          Left: number;
          Top: number;
          Height: number;
          Width: number;
        }>;
      }>;
    };
    TextOrientation: string;
    FileParseExitCode: number;
    ParsedText: string;
    ErrorMessage: string;
    ErrorDetails: string;
  }>;
  OCRExitCode: number;
  IsErroredOnProcessing: boolean;
  ProcessingTimeInMilliseconds: string;
  SearchablePDFURL: string;
}

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
      formData.append('isOverlayRequired', 'false');
      formData.append('detectOrientation', 'true');
      formData.append('isTable', 'true');
      formData.append('scale', 'true');
      formData.append('OCREngine', '2'); // Use OCR Engine 2 for better accuracy
      
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
    const patientInfo = this.extractPatientInfo(extractedText);
    
    // Extract lab parameters
    const parameters = this.extractParameters(extractedText);
    
    return {
      patientInfo,
      parameters
    };
  }

  private extractPatientInfo(text: string): ExtractedData['patientInfo'] {
    // Look for patient name patterns
    const nameMatch = text.match(/(?:Name|Patient)[:\s]+([A-Za-z\s\.]+)/i);
    const ageMatch = text.match(/(?:Age)[:\s]+(\d+(?:\s*(?:Years?|YRS?|Y))?)/i);
    const genderMatch = text.match(/(?:Sex|Gender)[:\s]+(M|F|Male|Female)/i);
    const dateMatch = text.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);
    const labNameMatch = text.match(/([A-Z\s]+LAB(?:ORATORY)?)/i);
    
    return {
      name: nameMatch?.[1]?.trim() || "Patient",
      age: ageMatch?.[1]?.replace(/[^\d]/g, '') + " YRS" || "Unknown",
      gender: genderMatch?.[1]?.charAt(0).toUpperCase() || "Unknown",
      reportDate: dateMatch?.[0] || new Date().toLocaleDateString(),
      labName: labNameMatch?.[0]?.trim()
    };
  }

  private extractParameters(text: string): ExtractedData['parameters'] {
    const parameters: ExtractedData['parameters'] = [];
    const lines = text.split('\n');
    
    // Enhanced test patterns with more comprehensive matching
    const testPatterns = {
      'Hemoglobin|HB|Hb|HAEMOGLOBIN': { normalRange: '13.0-17.0', unit: 'g/dL' },
      'Red Blood Cell|RBC|Red Blood Cells': { normalRange: '4.5-5.5', unit: 'million/mcL' },
      'White Blood Cell|WBC|White Blood Cells': { normalRange: '4000-11000', unit: '/mcL' },
      'Platelet|PLT|Platelets': { normalRange: '150-450', unit: 'thousand/mcL' },
      'Glucose|Sugar|Blood Sugar|GLUCOSE': { normalRange: '70-100', unit: 'mg/dL' },
      'Creatinine|CREATININE': { normalRange: '0.6-1.3', unit: 'mg/dL' },
      'Urea|BUN|Blood Urea Nitrogen': { normalRange: '7-20', unit: 'mg/dL' },
      'Cholesterol|Total Cholesterol|CHOLESTEROL': { normalRange: '150-200', unit: 'mg/dL' },
      'Lymphocyte|Lymphocytes': { normalRange: '20-40', unit: '%' },
      'Neutrophil|Neutrophils': { normalRange: '50-70', unit: '%' },
      'Monocyte|Monocytes': { normalRange: '2-10', unit: '%' },
      'Eosinophil|Eosinophils': { normalRange: '1-4', unit: '%' },
      'Total Protein|Protein': { normalRange: '6.0-8.3', unit: 'g/dL' },
      'Albumin|ALBUMIN': { normalRange: '3.5-5.0', unit: 'g/dL' },
      'Bilirubin|Total Bilirubin': { normalRange: '0.3-1.2', unit: 'mg/dL' },
      'ALT|SGPT|Alanine Transaminase': { normalRange: '7-56', unit: 'U/L' },
      'AST|SGOT|Aspartate Transaminase': { normalRange: '10-40', unit: 'U/L' }
    };

    lines.forEach(line => {
      for (const [testName, testInfo] of Object.entries(testPatterns)) {
        // Enhanced regex to capture more variations
        const regex = new RegExp(`(${testName}).*?([0-9]+\\.?[0-9]*)\\s*(?:${testInfo.unit})?`, 'i');
        const match = line.match(regex);
        
        if (match) {
          const name = match[1];
          const value = parseFloat(match[2]);
          const status = this.determineStatus(value, testInfo.normalRange);
          const severity = this.determineSeverity(status, value, testInfo.normalRange);
          
          parameters.push({
            name: name,
            value: value,
            unit: testInfo.unit,
            normalRange: testInfo.normalRange,
            status: status,
            severity: severity
          });
        }
      }
    });

    return parameters;
  }

  private determineStatus(value: number, normalRange: string): 'normal' | 'high' | 'low' {
    const [min, max] = normalRange.split('-').map(v => parseFloat(v));
    
    if (value < min) return 'low';
    if (value > max) return 'high';
    return 'normal';
  }

  private determineSeverity(status: string, value: number, normalRange: string): 'normal' | 'mild' | 'moderate' | 'critical' | 'monitor' {
    if (status === 'normal') return 'normal';
    
    const [min, max] = normalRange.split('-').map(v => parseFloat(v));
    const range = max - min;
    
    if (status === 'high') {
      const deviation = (value - max) / range;
      if (deviation > 0.5) return 'critical';
      if (deviation > 0.2) return 'moderate';
      return 'mild';
    } else {
      const deviation = (min - value) / range;
      if (deviation > 0.5) return 'critical';
      if (deviation > 0.2) return 'moderate';
      return 'mild';
    }
  }
}

// Import the interface from the original OCR service
export interface ExtractedData {
  patientInfo: {
    name: string;
    age: string;
    gender: string;
    reportDate: string;
    labName?: string;
  };
  parameters: Array<{
    name: string;
    value: number | string;
    unit: string;
    normalRange: string;
    status: 'normal' | 'high' | 'low';
    severity: 'normal' | 'mild' | 'moderate' | 'critical' | 'monitor';
  }>;
}

export const ocrApiService = new OCRApiService();
