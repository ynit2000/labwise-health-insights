
import { ExtractedData } from '@/types/ocrTypes';

interface PDFExportData {
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
}

export class PDFExportService {
  static async exportToPDF(data: PDFExportData, fileName: string = 'lab-report-analysis.pdf') {
    try {
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Popup blocked. Please allow popups for this site.');
      }

      // Generate HTML content for the PDF
      const htmlContent = this.generatePDFHTML(data);
      
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

  private static generatePDFHTML(data: PDFExportData): string {
    const currentDate = new Date().toLocaleDateString();
    const abnormalParameters = data.parameters.filter(p => p.status !== 'normal');
    const normalParameters = data.parameters.filter(p => p.status === 'normal');

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Lab Report Analysis</title>
    <style>
        @media print {
            @page {
                margin: 20mm;
                size: A4;
            }
            body {
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
            }
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.4;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            text-align: center;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        
        .header h1 {
            color: #2563eb;
            font-size: 28px;
            margin: 0;
            font-weight: 700;
        }
        
        .header p {
            color: #64748b;
            margin: 5px 0;
            font-size: 14px;
        }
        
        .section {
            margin-bottom: 25px;
            break-inside: avoid;
        }
        
        .section-title {
            background: #f1f5f9;
            padding: 12px 16px;
            border-left: 4px solid #2563eb;
            font-weight: 600;
            font-size: 16px;
            color: #1e293b;
            margin-bottom: 15px;
        }
        
        .patient-info {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            padding: 15px;
            background: #fafafa;
            border-radius: 8px;
        }
        
        .info-item {
            display: flex;
            flex-direction: column;
        }
        
        .info-label {
            font-weight: 600;
            color: #64748b;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .info-value {
            font-weight: 600;
            color: #1e293b;
            font-size: 14px;
            margin-top: 2px;
        }
        
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            margin-bottom: 20px;
        }
        
        .summary-card {
            text-align: center;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
        }
        
        .summary-card.normal {
            background: #f0fdf4;
            border-color: #bbf7d0;
        }
        
        .summary-card.attention {
            background: #fefce8;
            border-color: #fde047;
        }
        
        .summary-card.total {
            background: #eff6ff;
            border-color: #93c5fd;
        }
        
        .summary-number {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 5px;
        }
        
        .summary-number.normal { color: #16a34a; }
        .summary-number.attention { color: #ca8a04; }
        .summary-number.total { color: #2563eb; }
        
        .summary-label {
            font-size: 12px;
            color: #64748b;
            font-weight: 500;
        }
        
        .parameters-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }
        
        .parameters-table th,
        .parameters-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e2e8f0;
        }
        
        .parameters-table th {
            background: #f8fafc;
            font-weight: 600;
            color: #475569;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .parameters-table td {
            font-size: 14px;
        }
        
        .status-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .status-normal {
            background: #dcfce7;
            color: #166534;
        }
        
        .status-high {
            background: #fecaca;
            color: #991b1b;
        }
        
        .status-low {
            background: #fed7aa;
            color: #9a3412;
        }
        
        .recommendation-box {
            background: #eff6ff;
            border: 1px solid #93c5fd;
            border-radius: 8px;
            padding: 20px;
            margin-top: 15px;
        }
        
        .recommendation-title {
            font-weight: 600;
            color: #1d4ed8;
            margin-bottom: 10px;
            font-size: 16px;
        }
        
        .recommendation-text {
            color: #1e293b;
            line-height: 1.6;
        }
        
        .urgency-badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 16px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-right: 10px;
        }
        
        .urgency-routine {
            background: #dcfce7;
            color: #166534;
        }
        
        .urgency-urgent {
            background: #fecaca;
            color: #991b1b;
        }
        
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            color: #64748b;
            font-size: 12px;
        }
        
        .disclaimer {
            background: #fef3c7;
            border: 1px solid #fbbf24;
            border-radius: 8px;
            padding: 15px;
            margin-top: 20px;
        }
        
        .disclaimer-title {
            font-weight: 600;
            color: #92400e;
            margin-bottom: 8px;
        }
        
        .disclaimer-text {
            color: #92400e;
            font-size: 13px;
            line-height: 1.5;
        }
        
        @media print {
            .section {
                page-break-inside: avoid;
            }
            
            .parameters-table {
                page-break-inside: auto;
            }
            
            .parameters-table tr {
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Lab Report Analysis</h1>
        <p>Generated on ${currentDate}</p>
        <p>AI-Powered Medical Report Interpretation</p>
    </div>

    <div class="section">
        <div class="section-title">Patient Information</div>
        <div class="patient-info">
            <div class="info-item">
                <div class="info-label">Patient Name</div>
                <div class="info-value">${data.patientInfo.name}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Age</div>
                <div class="info-value">${data.patientInfo.age}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Gender</div>
                <div class="info-value">${data.patientInfo.gender}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Report Date</div>
                <div class="info-value">${data.patientInfo.reportDate}</div>
            </div>
            ${data.patientInfo.labName ? `
            <div class="info-item">
                <div class="info-label">Laboratory</div>
                <div class="info-value">${data.patientInfo.labName}</div>
            </div>
            ` : ''}
        </div>
    </div>

    <div class="section">
        <div class="section-title">Analysis Summary</div>
        <div class="summary-grid">
            <div class="summary-card normal">
                <div class="summary-number normal">${normalParameters.length}</div>
                <div class="summary-label">Normal Parameters</div>
            </div>
            <div class="summary-card attention">
                <div class="summary-number attention">${abnormalParameters.length}</div>
                <div class="summary-label">Need Attention</div>
            </div>
            <div class="summary-card total">
                <div class="summary-number total">${data.parameters.length}</div>
                <div class="summary-label">Total Parameters</div>
            </div>
        </div>
        
        <div class="recommendation-box">
            <div class="recommendation-title">
                <span class="urgency-badge urgency-${data.urgency}">${data.urgency === 'routine' ? 'Routine Follow-up' : 'Urgent'}</span>
                ${data.doctorType}
            </div>
            <div class="recommendation-text">${data.overallRecommendation}</div>
        </div>
    </div>

    ${abnormalParameters.length > 0 ? `
    <div class="section">
        <div class="section-title">Parameters Requiring Attention</div>
        <table class="parameters-table">
            <thead>
                <tr>
                    <th>Parameter</th>
                    <th>Value</th>
                    <th>Normal Range</th>
                    <th>Status</th>
                    <th>Severity</th>
                </tr>
            </thead>
            <tbody>
                ${abnormalParameters.map(param => `
                <tr>
                    <td><strong>${param.name}</strong></td>
                    <td>${param.value} ${param.unit}</td>
                    <td>${param.normalRange} ${param.unit}</td>
                    <td><span class="status-badge status-${param.status}">${param.status}</span></td>
                    <td><span class="status-badge status-${param.status}">${param.severity}</span></td>
                </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
    ` : ''}

    <div class="section">
        <div class="section-title">All Test Parameters</div>
        <table class="parameters-table">
            <thead>
                <tr>
                    <th>Parameter</th>
                    <th>Value</th>
                    <th>Normal Range</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${data.parameters.map(param => `
                <tr>
                    <td><strong>${param.name}</strong></td>
                    <td>${param.value} ${param.unit}</td>
                    <td>${param.normalRange} ${param.unit}</td>
                    <td><span class="status-badge status-${param.status}">${param.status}</span></td>
                </tr>
                `).join('')}
            </tbody>
        </table>
    </div>

    <div class="disclaimer">
        <div class="disclaimer-title">Medical Disclaimer</div>
        <div class="disclaimer-text">
            This analysis is for educational purposes only and should not replace professional medical advice. 
            Always consult with your healthcare provider for proper diagnosis and treatment. The AI interpretation 
            is based on general medical knowledge and may not account for individual medical history or conditions.
        </div>
    </div>
    
    <div class="footer">
        <p>This report was generated using AI-powered analysis • ${currentDate}</p>
        <p>For medical concerns, please consult with a qualified healthcare professional</p>
    </div>
</body>
</html>`;
  }
}
