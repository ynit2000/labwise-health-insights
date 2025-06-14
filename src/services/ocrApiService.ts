
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
    
    // Extract patient information with enhanced patterns
    const patientInfo = this.extractPatientInfo(extractedText);
    
    // Extract lab parameters with improved accuracy
    const parameters = this.extractParameters(extractedText);
    
    return {
      patientInfo,
      parameters
    };
  }

  private extractPatientInfo(text: string): ExtractedData['patientInfo'] {
    console.log('Extracting patient information...');
    
    // Enhanced name patterns - looking for various formats
    const namePatterns = [
      /(?:Patient\s*Name|Name|PATIENT|Mr\.|Mrs\.|Ms\.)\s*[:\-]?\s*([A-Za-z\s\.]{2,40})/i,
      /Name\s*:\s*([A-Za-z\s\.]{2,40})/i,
      /Patient\s*:\s*([A-Za-z\s\.]{2,40})/i,
      /^([A-Z][a-z]+\s+[A-Z][a-z]+)/m // First line pattern for names
    ];
    
    // Enhanced age patterns
    const agePatterns = [
      /(?:Age|AGE)\s*[:\-]?\s*(\d{1,3})\s*(?:Years?|YRS?|Y|yrs)?/i,
      /(\d{1,3})\s*(?:Years?|YRS?|Y)\s*(?:old)?/i,
      /Age[:\s]*(\d{1,3})/i
    ];
    
    // Enhanced gender patterns
    const genderPatterns = [
      /(?:Sex|Gender|GENDER|SEX)\s*[:\-]?\s*(M|F|Male|Female|MALE|FEMALE)/i,
      /\b(Male|Female|M|F)\b/i
    ];
    
    // Enhanced date patterns - multiple formats
    const datePatterns = [
      /(?:Date|Report\s*Date|Collection\s*Date|TEST\s*DATE)\s*[:\-]?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
      /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/g,
      /(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4})/i
    ];
    
    // Lab name patterns
    const labNamePatterns = [
      /([A-Z\s]+(?:LAB|LABORATORY|DIAGNOSTICS|PATHOLOGY|MEDICAL|HOSPITAL|CLINIC))/i,
      /((?:Dr\.?\s+)?[A-Z][a-z]+\s+(?:LAB|LABORATORY|DIAGNOSTICS))/i
    ];
    
    // Extract information using patterns
    let name = "Patient";
    let age = "Unknown";
    let gender = "Unknown";
    let reportDate = new Date().toLocaleDateString();
    let labName = undefined;
    
    // Extract name
    for (const pattern of namePatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const extractedName = match[1].trim();
        if (extractedName.length > 2 && extractedName.length < 40) {
          name = extractedName;
          break;
        }
      }
    }
    
    // Extract age
    for (const pattern of agePatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const ageNum = parseInt(match[1]);
        if (ageNum > 0 && ageNum < 150) {
          age = ageNum + " YRS";
          break;
        }
      }
    }
    
    // Extract gender
    for (const pattern of genderPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const genderValue = match[1].toUpperCase();
        if (genderValue === 'M' || genderValue === 'MALE') {
          gender = 'M';
          break;
        } else if (genderValue === 'F' || genderValue === 'FEMALE') {
          gender = 'F';
          break;
        }
      }
    }
    
    // Extract date
    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        reportDate = match[1];
        break;
      }
    }
    
    // Extract lab name
    for (const pattern of labNamePatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        labName = match[1].trim();
        break;
      }
    }
    
    console.log('Extracted patient info:', { name, age, gender, reportDate, labName });
    
    return {
      name,
      age,
      gender,
      reportDate,
      labName
    };
  }

  private extractParameters(text: string): ExtractedData['parameters'] {
    const parameters: ExtractedData['parameters'] = [];
    const lines = text.split('\n');
    
    // Enhanced test patterns with comprehensive matching
    const testPatterns = {
      'Hemoglobin|HB|Hb|HAEMOGLOBIN|HEMOGLOBIN': { normalRange: '13.0-17.0', unit: 'g/dL' },
      'Red Blood Cell|RBC|Red Blood Cells|RBC COUNT': { normalRange: '4.5-5.5', unit: 'million/mcL' },
      'White Blood Cell|WBC|White Blood Cells|WBC COUNT|TOTAL WBC': { normalRange: '4000-11000', unit: '/mcL' },
      'Platelet|PLT|Platelets|PLATELET COUNT': { normalRange: '150-450', unit: 'thousand/mcL' },
      'Glucose|Sugar|Blood Sugar|GLUCOSE|RANDOM GLUCOSE|FASTING GLUCOSE': { normalRange: '70-100', unit: 'mg/dL' },
      'Creatinine|CREATININE|SERUM CREATININE': { normalRange: '0.6-1.3', unit: 'mg/dL' },
      'Urea|BUN|Blood Urea Nitrogen|UREA NITROGEN': { normalRange: '7-20', unit: 'mg/dL' },
      'Cholesterol|Total Cholesterol|CHOLESTEROL|TOTAL CHOLESTEROL': { normalRange: '150-200', unit: 'mg/dL' },
      'Lymphocyte|Lymphocytes|LYMPH': { normalRange: '20-40', unit: '%' },
      'Neutrophil|Neutrophils|NEUT': { normalRange: '50-70', unit: '%' },
      'Monocyte|Monocytes|MONO': { normalRange: '2-10', unit: '%' },
      'Eosinophil|Eosinophils|EOS': { normalRange: '1-4', unit: '%' },
      'Total Protein|Protein|TOTAL PROTEIN': { normalRange: '6.0-8.3', unit: 'g/dL' },
      'Albumin|ALBUMIN|SERUM ALBUMIN': { normalRange: '3.5-5.0', unit: 'g/dL' },
      'Bilirubin|Total Bilirubin|TOTAL BILIRUBIN': { normalRange: '0.3-1.2', unit: 'mg/dL' },
      'ALT|SGPT|Alanine Transaminase|ALANINE TRANSAMINASE': { normalRange: '7-56', unit: 'U/L' },
      'AST|SGOT|Aspartate Transaminase|ASPARTATE TRANSAMINASE': { normalRange: '10-40', unit: 'U/L' },
      'HDL|HDL Cholesterol|HIGH DENSITY LIPOPROTEIN': { normalRange: '40-60', unit: 'mg/dL' },
      'LDL|LDL Cholesterol|LOW DENSITY LIPOPROTEIN': { normalRange: '100-130', unit: 'mg/dL' },
      'Triglycerides|TRIGLYCERIDES|TG': { normalRange: '150-200', unit: 'mg/dL' },
      'TSH|Thyroid Stimulating Hormone|THYROID STIMULATING HORMONE': { normalRange: '0.4-4.0', unit: 'mIU/L' }
    };

    console.log('Starting parameter extraction from', lines.length, 'lines');

    lines.forEach((line, index) => {
      for (const [testName, testInfo] of Object.entries(testPatterns)) {
        // Multiple regex patterns for better extraction
        const patterns = [
          new RegExp(`(${testName})\\s*[:\\-]?\\s*([0-9]+\\.?[0-9]*)\\s*(?:${testInfo.unit})?`, 'i'),
          new RegExp(`(${testName}).*?([0-9]+\\.?[0-9]*)`, 'i'),
          new RegExp(`([0-9]+\\.?[0-9]*)\\s*(?:${testInfo.unit})?\\s*.*?(${testName})`, 'i')
        ];
        
        for (const regex of patterns) {
          const match = line.match(regex);
          
          if (match) {
            let name, value;
            
            // Determine which group contains the name and value
            if (match[1] && isNaN(parseFloat(match[1]))) {
              name = match[1];
              value = parseFloat(match[2]);
            } else {
              name = match[2] || testName.split('|')[0];
              value = parseFloat(match[1]);
            }
            
            if (!isNaN(value) && value > 0) {
              const status = this.determineStatus(value, testInfo.normalRange);
              const severity = this.determineSeverity(status, value, testInfo.normalRange);
              
              // Avoid duplicates
              const isDuplicate = parameters.some(p => 
                p.name.toLowerCase().includes(name.toLowerCase()) ||
                name.toLowerCase().includes(p.name.toLowerCase())
              );
              
              if (!isDuplicate) {
                parameters.push({
                  name: name.trim(),
                  value: value,
                  unit: testInfo.unit,
                  normalRange: testInfo.normalRange,
                  status: status,
                  severity: severity
                });
                
                console.log('Extracted parameter:', { name: name.trim(), value, status });
                break; // Move to next test pattern
              }
            }
          }
        }
      }
    });

    console.log('Total parameters extracted:', parameters.length);
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
