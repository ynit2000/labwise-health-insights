
import { ExtractedData } from '@/types/ocrTypes';

export interface PDFExportData {
  patientInfo: ExtractedData['patientInfo'];
  parameters: Array<{
    name: string;
    value: number | string;
    unit: string;
    normalRange: string;
    status: 'normal' | 'high' | 'low';
    severity: 'normal' | 'mild' | 'moderate' | 'critical' | 'monitor';
    explanation?: string;
  }>;
  overallRecommendation: string;
  urgency: string;
  doctorType: string;
  timeframe?: string;
  nextSteps?: string[];
  reason?: string;
}

export interface PDFSummaryStats {
  normalParameters: any[];
  abnormalParameters: any[];
  criticalParameters: any[];
}
