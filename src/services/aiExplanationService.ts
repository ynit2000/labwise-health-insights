
import { DoctorRecommendation, StructuredRecommendation } from '@/types/explanationTypes';
import { ExtractedData } from '@/types/ocrTypes';
import { explanationGenerator } from '@/services/explanationGenerator';
import { doctorRecommendationService } from '@/services/doctorRecommendationService';
import { advancedMedicalRecommendationService } from '@/services/advancedMedicalRecommendationService';

export class AIExplanationService {
  generateExplanation(parameterName: string, status: string, value: number, normalRange: string): string {
    return explanationGenerator.generateExplanation(parameterName, status, value, normalRange);
  }

  generateDoctorRecommendation(parameters: any[]): DoctorRecommendation {
    return doctorRecommendationService.generateDoctorRecommendation(parameters);
  }

  generateStructuredRecommendation(data: ExtractedData): StructuredRecommendation {
    return advancedMedicalRecommendationService.generateStructuredRecommendation(data);
  }

  generateEnhancedDoctorRecommendation(data: ExtractedData): DoctorRecommendation {
    return advancedMedicalRecommendationService.generateEnhancedDoctorRecommendation(data);
  }
}

export const aiExplanationService = new AIExplanationService();
