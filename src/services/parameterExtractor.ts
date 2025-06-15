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
    'TSH|Thyroid Stimulating Hormone|THYROID STIMULATING HORMONE': { normalRange: '0.4-4.0', unit: 'mIU/L' },
    
    // Additional Blood Parameters
    'Hematocrit|HCT|HEMATOCRIT|PCV': { normalRange: '36-46', unit: '%' },
    'MCV|Mean Corpuscular Volume|MEAN CORPUSCULAR VOLUME': { normalRange: '80-100', unit: 'fL' },
    'MCH|Mean Corpuscular Hemoglobin|MEAN CORPUSCULAR HEMOGLOBIN': { normalRange: '27-32', unit: 'pg' },
    'MCHC|Mean Corpuscular Hemoglobin Concentration': { normalRange: '32-36', unit: 'g/dL' },
    'RDW|Red Cell Distribution Width|RED CELL DISTRIBUTION WIDTH': { normalRange: '11.5-14.5', unit: '%' },
    'MPV|Mean Platelet Volume|MEAN PLATELET VOLUME': { normalRange: '7.5-11.5', unit: 'fL' },
    
    // Liver Function Tests
    'ALP|Alkaline Phosphatase|ALKALINE PHOSPHATASE': { normalRange: '44-147', unit: 'U/L' },
    'GGT|Gamma GT|GAMMA GT|GAMMA GLUTAMYL TRANSFERASE': { normalRange: '9-48', unit: 'U/L' },
    'Direct Bilirubin|DIRECT BILIRUBIN|CONJUGATED BILIRUBIN': { normalRange: '0.0-0.3', unit: 'mg/dL' },
    'Indirect Bilirubin|INDIRECT BILIRUBIN|UNCONJUGATED BILIRUBIN': { normalRange: '0.2-0.8', unit: 'mg/dL' },
    
    // Kidney Function Tests
    'BUN Creatinine Ratio|BUN/CREATININE RATIO': { normalRange: '10-20', unit: 'ratio' },
    'eGFR|Estimated GFR|ESTIMATED GLOMERULAR FILTRATION RATE': { normalRange: '90-120', unit: 'mL/min/1.73m2' },
    'Uric Acid|URIC ACID|SERUM URIC ACID': { normalRange: '3.4-7.0', unit: 'mg/dL' },
    
    // Electrolytes
    'Sodium|Na|SODIUM|SERUM SODIUM': { normalRange: '136-145', unit: 'mEq/L' },
    'Potassium|K|POTASSIUM|SERUM POTASSIUM': { normalRange: '3.5-5.1', unit: 'mEq/L' },
    'Chloride|Cl|CHLORIDE|SERUM CHLORIDE': { normalRange: '98-107', unit: 'mEq/L' },
    'CO2|Carbon Dioxide|CARBON DIOXIDE|BICARBONATE': { normalRange: '22-29', unit: 'mEq/L' },
    'Calcium|Ca|CALCIUM|SERUM CALCIUM': { normalRange: '8.5-10.5', unit: 'mg/dL' },
    'Phosphorus|P|PHOSPHORUS|SERUM PHOSPHORUS': { normalRange: '2.5-4.5', unit: 'mg/dL' },
    'Magnesium|Mg|MAGNESIUM|SERUM MAGNESIUM': { normalRange: '1.7-2.2', unit: 'mg/dL' },
    
    // Cardiac Markers
    'CK|Creatine Kinase|CREATINE KINASE': { normalRange: '30-200', unit: 'U/L' },
    'CK-MB|CKMB|CREATINE KINASE MB': { normalRange: '0-6.3', unit: 'ng/mL' },
    'Troponin I|TROPONIN I|CARDIAC TROPONIN I': { normalRange: '0-0.04', unit: 'ng/mL' },
    'Troponin T|TROPONIN T|CARDIAC TROPONIN T': { normalRange: '0-0.01', unit: 'ng/mL' },
    'LDH|Lactate Dehydrogenase|LACTATE DEHYDROGENASE': { normalRange: '140-280', unit: 'U/L' },
    
    // Thyroid Function Tests
    'T3|Triiodothyronine|TRIIODOTHYRONINE': { normalRange: '80-200', unit: 'ng/dL' },
    'T4|Thyroxine|THYROXINE|TOTAL T4': { normalRange: '4.5-12.0', unit: 'mcg/dL' },
    'Free T4|FT4|FREE T4|FREE THYROXINE': { normalRange: '0.8-1.8', unit: 'ng/dL' },
    'Free T3|FT3|FREE T3|FREE TRIIODOTHYRONINE': { normalRange: '2.3-4.2', unit: 'pg/mL' },
    
    // Diabetes Markers
    'HbA1c|A1C|HEMOGLOBIN A1C|GLYCATED HEMOGLOBIN': { normalRange: '4.0-5.6', unit: '%' },
    'Fructosamine|FRUCTOSAMINE': { normalRange: '205-285', unit: 'μmol/L' },
    'C-Peptide|C PEPTIDE': { normalRange: '0.5-2.0', unit: 'ng/mL' },
    'Insulin|INSULIN|SERUM INSULIN': { normalRange: '2.6-24.9', unit: 'μIU/mL' },
    
    // Inflammatory Markers
    'ESR|Erythrocyte Sedimentation Rate|ERYTHROCYTE SEDIMENTATION RATE': { normalRange: '0-30', unit: 'mm/hr' },
    'CRP|C-Reactive Protein|C REACTIVE PROTEIN': { normalRange: '0-3.0', unit: 'mg/L' },
    'Procalcitonin|PROCALCITONIN': { normalRange: '0-0.25', unit: 'ng/mL' },
    
    // Vitamins and Minerals
    'Vitamin D|25-OH Vitamin D|25 HYDROXY VITAMIN D': { normalRange: '30-100', unit: 'ng/mL' },
    'Vitamin B12|B12|VITAMIN B12': { normalRange: '200-900', unit: 'pg/mL' },
    'Folate|Folic Acid|FOLIC ACID': { normalRange: '2.7-17.0', unit: 'ng/mL' },
    'Iron|Fe|SERUM IRON': { normalRange: '60-170', unit: 'mcg/dL' },
    'TIBC|Total Iron Binding Capacity|TOTAL IRON BINDING CAPACITY': { normalRange: '240-450', unit: 'mcg/dL' },
    'Transferrin Saturation|TRANSFERRIN SATURATION': { normalRange: '20-50', unit: '%' },
    'Ferritin|FERRITIN|SERUM FERRITIN': { normalRange: '12-300', unit: 'ng/mL' },
    
    // Coagulation Tests
    'PT|Prothrombin Time|PROTHROMBIN TIME': { normalRange: '11-13', unit: 'seconds' },
    'PTT|Partial Thromboplastin Time|PARTIAL THROMBOPLASTIN TIME': { normalRange: '25-35', unit: 'seconds' },
    'INR|International Normalized Ratio|INTERNATIONAL NORMALIZED RATIO': { normalRange: '0.8-1.1', unit: 'ratio' },
    
    // Tumor Markers
    'PSA|Prostate Specific Antigen|PROSTATE SPECIFIC ANTIGEN': { normalRange: '0-4.0', unit: 'ng/mL' },
    'CEA|Carcinoembryonic Antigen|CARCINOEMBRYONIC ANTIGEN': { normalRange: '0-2.5', unit: 'ng/mL' },
    'AFP|Alpha Fetoprotein|ALPHA FETOPROTEIN': { normalRange: '0-10', unit: 'ng/mL' },
    
    // Hormones
    'Cortisol|CORTISOL|SERUM CORTISOL': { normalRange: '6-23', unit: 'mcg/dL' },
    'Testosterone|TESTOSTERONE|TOTAL TESTOSTERONE': { normalRange: '300-1000', unit: 'ng/dL' },
    'Estradiol|E2|ESTRADIOL': { normalRange: '15-350', unit: 'pg/mL' },
    'Prolactin|PROLACTIN|SERUM PROLACTIN': { normalRange: '4-23', unit: 'ng/mL' },
    'LH|Luteinizing Hormone|LUTEINIZING HORMONE': { normalRange: '1.7-8.6', unit: 'mIU/mL' },
    'FSH|Follicle Stimulating Hormone|FOLLICLE STIMULATING HORMONE': { normalRange: '1.5-12.4', unit: 'mIU/mL' }
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
