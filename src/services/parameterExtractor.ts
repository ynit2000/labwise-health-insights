
import { ExtractedData } from '@/types/ocrTypes';

export class ParameterExtractor {
  private static readonly testPatterns = {
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

  static extractParameters(text: string): ExtractedData['parameters'] {
    const parameters: ExtractedData['parameters'] = [];
    const lines = text.split('\n');

    console.log('Starting parameter extraction from', lines.length, 'lines');

    lines.forEach((line, index) => {
      for (const [testName, testInfo] of Object.entries(this.testPatterns)) {
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

  private static determineStatus(value: number, normalRange: string): 'normal' | 'high' | 'low' {
    const [min, max] = normalRange.split('-').map(v => parseFloat(v));
    
    if (value < min) return 'low';
    if (value > max) return 'high';
    return 'normal';
  }

  private static determineSeverity(status: string, value: number, normalRange: string): 'normal' | 'mild' | 'moderate' | 'critical' | 'monitor' {
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
