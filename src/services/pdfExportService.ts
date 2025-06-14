
import { PDFExportData } from '@/types/pdfTypes';
import { PDFTemplateGenerator } from './pdf/pdfTemplateGenerator';

export class PDFExportService {
  static async exportToPDF(data: PDFExportData, fileName: string = 'lab-report-analysis.pdf') {
    try {
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Popup blocked. Please allow popups for this site.');
      }

      // Generate HTML content for the PDF
      const htmlContent = PDFTemplateGenerator.generateHTML(data);
      
      // Write content to the new window
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Wait for content to load, then print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500);
      };
      
    } catch (error) {
      console.error('PDF export failed:', error);
      throw new Error('Failed to export PDF. Please try again.');
    }
  }
}
