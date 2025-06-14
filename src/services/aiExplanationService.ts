
import { DoctorRecommendation } from '@/types/explanationTypes';
import { explanationGenerator } from '@/services/explanationGenerator';
import { doctorRecommendationService } from '@/services/doctorRecommendationService';

export class AIExplanationService {
  generateExplanation(parameterName: string, status: string, value: number, normalRange: string): string {
    return explanationGenerator.generateExplanation(parameterName, status, value, normalRange);
  }

  generateDoctorRecommendation(parameters: any[]): DoctorRecommendation {
    return doctorRecommendationService.generateDoctorRecommendation(parameters);
  }
}

export const aiExplanationService = new AIExplanationService();
