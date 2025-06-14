
import { ExplanationDatabase } from '@/types/explanationTypes';

export const explanationDatabase: ExplanationDatabase = {
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
