
export interface ParameterExplanation {
  explanation: string;
  recommendations: string[];
  urgency: 'routine' | 'moderate' | 'urgent';
  doctorSpecialty?: string;
}

export interface DoctorRecommendation {
  specialty: string;
  urgency: 'routine' | 'moderate' | 'urgent';
  reason: string;
  timeframe: string;
  nextSteps: string[];
}

export type ExplanationDatabase = Record<string, Record<string, ParameterExplanation>>;
