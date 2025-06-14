
interface ParameterExplanation {
  explanation: string;
  recommendations: string[];
  urgency: 'routine' | 'moderate' | 'urgent';
}

export class AIExplanationService {
  private explanationDatabase: Record<string, Record<string, ParameterExplanation>> = {
    'Hemoglobin': {
      'low': {
        explanation: 'Low hemoglobin indicates anemia, which means your blood has fewer red blood cells than normal. This can cause fatigue, weakness, and shortness of breath.',
        recommendations: ['Eat iron-rich foods', 'Consider iron supplements', 'Get adequate rest'],
        urgency: 'moderate'
      },
      'high': {
        explanation: 'High hemoglobin levels may indicate dehydration, lung disease, or other conditions. Your blood is thicker than normal.',
        recommendations: ['Stay well hydrated', 'Avoid smoking', 'Consult your doctor'],
        urgency: 'routine'
      }
    },
    'Glucose': {
      'high': {
        explanation: 'High blood glucose (sugar) levels may indicate diabetes or prediabetes. This means your body is having trouble processing sugar.',
        recommendations: ['Monitor diet and reduce sugar intake', 'Exercise regularly', 'Check blood sugar regularly'],
        urgency: 'moderate'
      },
      'low': {
        explanation: 'Low blood glucose can cause dizziness, confusion, and weakness. This may happen if you haven\'t eaten or have taken too much diabetes medication.',
        recommendations: ['Eat regular meals', 'Avoid skipping meals', 'Monitor blood sugar'],
        urgency: 'moderate'
      }
    },
    'Creatinine': {
      'high': {
        explanation: 'High creatinine levels suggest your kidneys may not be filtering waste from your blood effectively. This could indicate kidney problems.',
        recommendations: ['Stay well hydrated', 'Reduce protein intake', 'Monitor blood pressure'],
        urgency: 'moderate'
      }
    },
    'Lymphocyte': {
      'low': {
        explanation: 'Low lymphocyte count may indicate a weakened immune system, recent infection, or stress on your body.',
        recommendations: ['Get adequate rest', 'Eat a balanced diet', 'Manage stress levels'],
        urgency: 'routine'
      },
      'high': {
        explanation: 'High lymphocyte count may indicate your body is fighting an infection or other immune response.',
        recommendations: ['Monitor for symptoms of infection', 'Get adequate rest', 'Stay hydrated'],
        urgency: 'routine'
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

  private cleanParameterName(name: string): string {
    // Remove common prefixes and clean up parameter names
    return name.replace(/^(Mean|Total|Complete)\s+/i, '')
              .replace(/\s+Count$/i, '')
              .replace(/\s+Cell.*$/i, '')
              .trim();
  }
}

export const aiExplanationService = new AIExplanationService();
