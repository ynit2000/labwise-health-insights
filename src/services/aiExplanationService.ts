
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
        explanation: 'High blood glucose (sugar) levels may indicate diabetes or prediabetes. This means your body is having trouble processing sugar.',
        recommendations: ['Monitor diet and reduce sugar intake', 'Exercise regularly', 'Check blood sugar regularly'],
        urgency: 'moderate',
        doctorSpecialty: 'Endocrinologist'
      },
      'low': {
        explanation: 'Low blood glucose can cause dizziness, confusion, and weakness. This may happen if you haven\'t eaten or have taken too much diabetes medication.',
        recommendations: ['Eat regular meals', 'Avoid skipping meals', 'Monitor blood sugar'],
        urgency: 'moderate',
        doctorSpecialty: 'Endocrinologist'
      }
    },
    'Creatinine': {
      'high': {
        explanation: 'High creatinine levels suggest your kidneys may not be filtering waste from your blood effectively. This could indicate kidney problems.',
        recommendations: ['Stay well hydrated', 'Reduce protein intake', 'Monitor blood pressure'],
        urgency: 'moderate',
        doctorSpecialty: 'Nephrologist'
      }
    },
    'Lymphocyte': {
      'low': {
        explanation: 'Low lymphocyte count may indicate a weakened immune system, recent infection, or stress on your body.',
        recommendations: ['Get adequate rest', 'Eat a balanced diet', 'Manage stress levels'],
        urgency: 'routine',
        doctorSpecialty: 'General Physician'
      },
      'high': {
        explanation: 'High lymphocyte count may indicate your body is fighting an infection or other immune response.',
        recommendations: ['Monitor for symptoms of infection', 'Get adequate rest', 'Stay hydrated'],
        urgency: 'routine',
        doctorSpecialty: 'General Physician'
      }
    },
    'Cholesterol': {
      'high': {
        explanation: 'High cholesterol levels increase your risk of heart disease and stroke.',
        recommendations: ['Follow a heart-healthy diet', 'Exercise regularly', 'Consider medication if needed'],
        urgency: 'routine',
        doctorSpecialty: 'Cardiologist'
      }
    },
    'Liver': {
      'high': {
        explanation: 'Elevated liver enzymes may indicate liver inflammation or damage.',
        recommendations: ['Avoid alcohol', 'Eat a healthy diet', 'Monitor liver function'],
        urgency: 'moderate',
        doctorSpecialty: 'Gastroenterologist'
      }
    }
  };

  generateExplanation(parameterName: string, status: string, value: number, normalRange: string): string {
    const cleanName = this.cleanParameterName(parameterName);
    const explanation = this.explanationDatabase[cleanName]?.[status];
    
    if (explanation) {
      return explanation.explanation;
    }
    
    // Fallback explanation
    return `Your ${cleanName} level is ${status === 'high' ? 'above' : 'below'} the normal range (${normalRange}). This may require monitoring or follow-up with your healthcare provider.`;
  }

  getRecommendations(parameterName: string, status: string): string[] {
    const cleanName = this.cleanParameterName(parameterName);
    const explanation = this.explanationDatabase[cleanName]?.[status];
    
    return explanation?.recommendations || ['Consult with your healthcare provider for personalized advice'];
  }

  getUrgency(parameterName: string, status: string, severity: string): 'routine' | 'moderate' | 'urgent' {
    if (severity === 'critical') return 'urgent';
    
    const cleanName = this.cleanParameterName(parameterName);
    const explanation = this.explanationDatabase[cleanName]?.[status];
    
    return explanation?.urgency || 'routine';
  }

  generateDoctorRecommendation(parameters: any[]): DoctorRecommendation {
    const abnormalParams = parameters.filter(p => p.status !== 'normal');
    const criticalParams = abnormalParams.filter(p => p.severity === 'critical');
    
    // Determine primary specialty needed
    const specialties = new Map<string, number>();
    abnormalParams.forEach(param => {
      const cleanName = this.cleanParameterName(param.name);
      const specialty = this.getSpecialtyForParameter(cleanName, param.status);
      specialties.set(specialty, (specialties.get(specialty) || 0) + 1);
    });
    
    let primarySpecialty = 'General Physician';
    let maxCount = 0;
    specialties.forEach((count, specialty) => {
      if (count > maxCount) {
        maxCount = count;
        primarySpecialty = specialty;
      }
    });
    
    // Determine urgency
    let urgency: 'routine' | 'moderate' | 'urgent' = 'routine';
    let reason = '';
    let timeframe = '';
    let nextSteps: string[] = [];
    
    if (criticalParams.length > 0) {
      urgency = 'urgent';
      reason = `Critical values detected in ${criticalParams.map(p => p.name).join(', ')}. Immediate medical attention is required.`;
      timeframe = 'Within 24-48 hours';
      nextSteps = [
        'Contact your healthcare provider immediately',
        'Do not delay seeking medical care',
        'Bring your complete lab report',
        'List any symptoms you\'re experiencing'
      ];
    } else if (abnormalParams.length > 3) {
      urgency = 'moderate';
      reason = `Multiple parameters (${abnormalParams.length}) are outside normal range, requiring comprehensive evaluation.`;
      timeframe = 'Within 1-2 weeks';
      nextSteps = [
        'Schedule an appointment with your doctor',
        'Prepare a list of current medications',
        'Note any symptoms or changes in health',
        'Consider lifestyle modifications discussed'
      ];
    } else if (abnormalParams.length > 0) {
      urgency = 'routine';
      reason = `Some parameters need monitoring and may benefit from specialist consultation.`;
      timeframe = 'Within 2-4 weeks';
      nextSteps = [
        'Schedule a routine follow-up appointment',
        'Monitor symptoms and overall health',
        'Consider recommended lifestyle changes',
        'Keep track of any health changes'
      ];
    } else {
      reason = 'All parameters are within normal limits. Routine preventive care recommended.';
      timeframe = 'Annual check-up';
      nextSteps = [
        'Continue current healthy lifestyle',
        'Schedule annual physical examination',
        'Maintain recommended screening schedule',
        'Keep up with preventive care'
      ];
    }
    
    return {
      specialty: primarySpecialty,
      urgency,
      reason,
      timeframe,
      nextSteps
    };
  }

  private getSpecialtyForParameter(parameterName: string, status: string): string {
    const explanation = this.explanationDatabase[parameterName]?.[status];
    return explanation?.doctorSpecialty || 'General Physician';
  }

  private cleanParameterName(name: string): string {
    // Remove common prefixes and clean up parameter names
    const cleaned = name.replace(/^(Mean|Total|Complete)\s+/i, '')
                       .replace(/\s+Count$/i, '')
                       .replace(/\s+Cell.*$/i, '')
                       .trim();
    
    // Map common variations to standard names
    if (cleaned.toLowerCase().includes('cholesterol')) return 'Cholesterol';
    if (cleaned.toLowerCase().includes('liver') || cleaned.toLowerCase().includes('alt') || cleaned.toLowerCase().includes('ast')) return 'Liver';
    
    return cleaned;
  }
}

export const aiExplanationService = new AIExplanationService();
