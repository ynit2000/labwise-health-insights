
import { ExtractedData } from '@/types/ocrTypes';

export class PatientInfoExtractor {
  static extractPatientInfo(text: string): ExtractedData['patientInfo'] {
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
}
