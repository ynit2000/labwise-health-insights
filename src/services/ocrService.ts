
import Tesseract from 'tesseract.js';

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

export class OCRService {
  async extractTextFromFile(file: File): Promise<string> {
    try {
      console.log('Starting OCR extraction for file:', file.name);
      
      const { data: { text } } = await Tesseract.recognize(
        file,
        'eng',
        {
          logger: m => console.log('OCR Progress:', m)
        }
      );
      
      console.log('OCR extraction completed. Text length:', text.length);
      return text;
    } catch (error) {
      console.error('OCR extraction failed:', error);
      throw new Error('Failed to extract text from image');
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
    const lines = text.split('\n');
    
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
    
    // Common lab test patterns with their normal ranges
    const testPatterns = {
      'Hemoglobin|HB|Hb': { normalRange: '13.0-17.0', unit: 'g/dL' },
      'Red Blood Cell|RBC': { normalRange: '4.5-5.5', unit: 'million/mcL' },
      'White Blood Cell|WBC': { normalRange: '4000-11000', unit: '/mcL' },
      'Platelet|PLT': { normalRange: '150-450', unit: 'thousand/mcL' },
      'Glucose|Sugar': { normalRange: '70-100', unit: 'mg/dL' },
      'Creatinine': { normalRange: '0.6-1.3', unit: 'mg/dL' },
      'Urea|BUN': { normalRange: '7-20', unit: 'mg/dL' },
      'Cholesterol': { normalRange: '150-200', unit: 'mg/dL' },
      'Lymphocyte': { normalRange: '20-40', unit: '%' },
      'Neutrophil': { normalRange: '50-70', unit: '%' },
      'Monocyte': { normalRange: '2-10', unit: '%' },
      'Eosinophil': { normalRange: '1-4', unit: '%' },
      'Protein': { normalRange: '20-45', unit: 'mg/dL' },
      'Chloride': { normalRange: '98-107', unit: 'mg/dL' }
    };

    lines.forEach(line => {
      for (const [testName, testInfo] of Object.entries(testPatterns)) {
        const regex = new RegExp(`(${testName}).*?([0-9]+\\.?[0-9]*)`, 'i');
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

export const ocrService = new OCRService();
