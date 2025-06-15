
export interface ParameterExplanation {
  explanation: string;
  recommendations: string[];
  urgency: 'routine' | 'moderate' | 'urgent' | 'critical';
  doctorSpecialty?: string;
  clinicalSignificance?: string;
  differentialDiagnoses?: string[];
  testLimitations?: string[];
}

export interface DoctorRecommendation {
  specialty: string;
  urgency: 'routine' | 'moderate' | 'urgent' | 'critical';
  reason: string;
  timeframe: string;
  nextSteps: string[];
  severity: 'low' | 'moderate' | 'high' | 'critical';
  immediateActions?: string[];
  investigations?: string[];
  lifestyleAdjustments?: string[];
  drugInteractions?: string[];
  contraindications?: string[];
  patientEducation?: string[];
}

export interface StructuredRecommendation {
  patientSummary: {
    name: string;
    age: number;
    gender: string;
    reportsAnalyzed: string[];
  };
  keyAbnormalities: Array<{
    testName: string;
    result: string;
    clinicalSignificance: string;
    severity: 'critical' | 'urgent' | 'moderate' | 'routine';
  }>;
  specificRecommendations: string[];
  generalRecommendationsByCondition: Record<string, string[]>;
  criticalNotes: string[];
  urgencyLevel: 'critical' | 'urgent' | 'moderate' | 'routine';
}

export type ExplanationDatabase = Record<string, Record<string, ParameterExplanation>>;
