
import { explanationDatabase } from '@/data/explanationDatabase';

export class ExplanationGenerator {
  generateExplanation(parameterName: string, status: string, value: number, normalRange: string): string {
    const cleanName = this.cleanParameterName(parameterName);
    const explanation = explanationDatabase[cleanName]?.[status];
    
    if (explanation) {
      return explanation.explanation;
    }
    
    return `Your ${cleanName} level is ${status === 'high' ? 'above' : 'below'} the normal range (${normalRange}).`;
  }

  private cleanParameterName(name: string): string {
    const cleaned = name.replace(/^(Mean|Total|Complete)\s+/i, '')
                       .replace(/\s+Count$/i, '')
                       .replace(/\s+Cell.*$/i, '')
                       .trim();
    
    if (cleaned.toLowerCase().includes('cholesterol')) return 'Cholesterol';
    if (cleaned.toLowerCase().includes('liver') || cleaned.toLowerCase().includes('alt') || cleaned.toLowerCase().includes('ast')) return 'Liver';
    
    return cleaned;
  }
}

export const explanationGenerator = new ExplanationGenerator();
