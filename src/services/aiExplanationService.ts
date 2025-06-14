
interface ParameterExplanation {
  explanation: string;
  recommendations: string[];
  urgency: 'routine' | 'moderate' | 'urgent';
  doctorSpecialty?: string;
}

interface DoctorRecommendation {
  specialty: string;
  urgency: 'routine' | 'moderate' | 'urgent';
  reason: string;
  timeframe: string;
  nextSteps: string[];
}

export class AIExplanationService {
  private explanationDatabase: Record<string, Record<string, ParameterExplanation>> = {
    'Hemoglobin': {
      'low': {
        explanation: 'Low hemoglobin indicates anemia, which means your blood has fewer red blood cells than normal. This can cause fatigue, weakness, and shortness of breath.',
        recommendations: ['Eat iron-rich foods', 'Consider iron supplements', 'Get adequate rest'],
        urgency: 'moderate',
        doctorSpecialty: 'Hematologist'
      },
      'high': {
        explanation: 'High hemoglobin levels may indicate dehydration, lung disease, or other conditions. Your blood is thicker than normal.',
        recommendations: ['Stay well hydrated', 'Avoid smoking', 'Consult your doctor'],
        urgency: 'routine',
        doctorSpecialty: 'General Physician'
      }
    },
    'Glucose': {
      'high': {
        explanation: 'High blood glucose levels may indicate diabetes or prediabetes.',
        recommendations: ['Monitor diet', 'Exercise regularly', 'Check blood sugar regularly'],
        urgency: 'moderate',
        doctorSpecialty: 'Endocrinologist'
      },
      'low': {
        explanation: 'Low blood glucose can cause dizziness and weakness.',
        recommendations: ['Eat regular meals', 'Monitor blood sugar'],
        urgency: 'moderate',
        doctorSpecialty: 'Endocrinologist'
      }
    },
    'Creatinine': {
      'high': {
        explanation: 'High creatinine levels suggest your kidneys may not be filtering waste effectively.',
        recommendations: ['Stay hydrated', 'Monitor blood pressure'],
        urgency: 'moderate',
        doctorSpecialty: 'Nephrologist'
      }
    }
  };

  generateExplanation(parameterName: string, status: string, value: number, normalRange: string): string {
    const cleanName = this.cleanParameterName(parameterName);
    const explanation = this.explanationDatabase[cleanName]?.[status];
    
    if (explanation) {
      return explanation.explanation;
    }
    
    return `Your ${cleanName} level is ${status === 'high' ? 'above' : 'below'} the normal range (${normalRange}).`;
  }

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

export const aiExplanationService = new AIExplanationService();
