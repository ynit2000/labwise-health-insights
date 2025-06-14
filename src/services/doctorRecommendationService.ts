
import { DoctorRecommendation } from '@/types/explanationTypes';

export class DoctorRecommendationService {
  generateDoctorRecommendation(parameters: any[]): DoctorRecommendation {
    const abnormalParams = parameters.filter(p => p.status !== 'normal');
    const criticalCount = abnormalParams.filter(p => p.severity === 'critical').length;
    
    let urgency: 'routine' | 'moderate' | 'urgent' = 'routine';
    let specialty = 'General Physician';
    let reason = '';
    let timeframe = '';
    
    if (criticalCount > 0) {
      urgency = 'urgent';
      reason = `Critical values detected. Immediate medical attention required.`;
      timeframe = 'Within 24-48 hours';
      specialty = 'Emergency Medicine';
    } else if (abnormalParams.length > 3) {
      urgency = 'moderate';
      reason = `Multiple parameters (${abnormalParams.length}) are outside normal range.`;
      timeframe = 'Within 1-2 weeks';
      specialty = 'General Physician';
    } else if (abnormalParams.length > 0) {
      urgency = 'routine';
      reason = `Some parameters need monitoring.`;
      timeframe = 'Within 2-4 weeks';
      specialty = 'General Physician';
    } else {
      reason = 'All parameters are within normal limits.';
      timeframe = 'Annual check-up';
    }
    
    const nextSteps = this.getNextSteps(urgency);
    
    return {
      specialty,
      urgency,
      reason,
      timeframe,
      nextSteps
    };
  }

  private getNextSteps(urgency: 'routine' | 'moderate' | 'urgent'): string[] {
    switch (urgency) {
      case 'urgent':
        return [
          'Contact your healthcare provider immediately',
          'Do not delay seeking medical care',
          'Bring your complete lab report'
        ];
      case 'moderate':
        return [
          'Schedule an appointment with your doctor',
          'Prepare a list of current medications',
          'Note any symptoms or changes in health'
        ];
      default:
        return [
          'Schedule a routine follow-up appointment',
          'Continue current healthy lifestyle',
          'Monitor overall health'
        ];
    }
  }
}

export const doctorRecommendationService = new DoctorRecommendationService();
