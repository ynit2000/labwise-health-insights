
import { PDFExportData, PDFSummaryStats } from '@/types/pdfTypes';

export const calculateSummaryStats = (data: PDFExportData): PDFSummaryStats => {
  const abnormalParameters = data.parameters.filter(p => p.status !== 'normal');
  const normalParameters = data.parameters.filter(p => p.status === 'normal');
  const criticalParameters = abnormalParameters.filter(p => p.severity === 'critical');

  return {
    normalParameters,
    abnormalParameters,
    criticalParameters
  };
};

export const getUrgencyIcon = (urgency: string): string => {
  switch (urgency) {
    case 'urgent': return '🚨';
    case 'moderate': return '⚠️';
    default: return '📅';
  }
};

export const getUrgencyLabel = (urgency: string): string => {
  switch (urgency) {
    case 'urgent': return 'Urgent';
    case 'moderate': return 'Moderate Priority';
    default: return 'Routine';
  }
};

export const formatFileName = (patientName: string): string => {
  const cleanName = patientName.toLowerCase().replace(/\s+/g, '-');
  const date = new Date().toISOString().split('T')[0];
  return `lab-report-${cleanName}-${date}.pdf`;
};
