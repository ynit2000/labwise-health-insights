
import { PDFExportData } from '@/types/pdfTypes';
import { getPDFStyles } from './pdfStyles';
import { calculateSummaryStats } from './pdfUtilities';
import {
  generateHeaderSection,
  generatePatientInfoSection,
  generateSummarySection,
  generateAbnormalParametersSection,
  generateCompleteResultsSection,
  generateHealthTipsSection,
  generateDisclaimerSection,
  generateFooterSection
} from './pdfContentSections';

export class PDFTemplateGenerator {
  static generateHTML(data: PDFExportData): string {
    const currentDate = new Date().toLocaleDateString();
    const stats = calculateSummaryStats(data);

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Lab Report Analysis</title>
    <style>
        ${getPDFStyles()}
    </style>
</head>
<body>
    ${generateHeaderSection(currentDate)}
    ${generatePatientInfoSection(data)}
    ${generateSummarySection(data, stats)}
    ${generateAbnormalParametersSection(stats)}
    ${generateCompleteResultsSection(data)}
    ${generateHealthTipsSection(data, stats)}
    ${generateDisclaimerSection()}
    ${generateFooterSection(currentDate)}
</body>
</html>`;
  }
}
