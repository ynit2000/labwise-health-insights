
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
  timeframe?: string;
  nextSteps?: string[];
  reason?: string;
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
    const criticalParameters = abnormalParameters.filter(p => p.severity === 'critical');

    // Generate urgency-specific content
    const getUrgencyIcon = (urgency: string) => {
      switch (urgency) {
        case 'urgent': return '🚨';
        case 'moderate': return '⚠️';
        default: return '📅';
      }
    };

    const getUrgencyLabel = (urgency: string) => {
      switch (urgency) {
        case 'urgent': return 'Urgent';
        case 'moderate': return 'Moderate Priority';
        default: return 'Routine';
      }
    };

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Lab Report Analysis</title>
    <style>
        @media print {
            @page {
                margin: 15mm;
                size: A4;
            }
            body {
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
            }
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.5;
            color: #1f2937;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            font-size: 12px;
        }
        
        .header {
            text-align: center;
            border-bottom: 3px solid #3b82f6;
            padding-bottom: 20px;
            margin-bottom: 25px;
        }
        
        .header h1 {
            color: #1e40af;
            font-size: 24px;
            margin: 0;
            font-weight: 700;
        }
        
        .header .subtitle {
            color: #64748b;
            margin: 8px 0 4px 0;
            font-size: 14px;
            font-weight: 500;
        }
        
        .header .date {
            color: #94a3b8;
            font-size: 11px;
        }
        
        .section {
            margin-bottom: 20px;
            break-inside: avoid;
        }
        
        .section-title {
            background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
            padding: 10px 14px;
            border-left: 4px solid #3b82f6;
            font-weight: 600;
            font-size: 14px;
            color: #1e293b;
            margin-bottom: 12px;
            border-radius: 0 6px 6px 0;
        }
        
        .patient-info {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 12px;
            padding: 14px;
            background: #f8fafc;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
        }
        
        .info-item {
            display: flex;
            flex-direction: column;
        }
        
        .info-label {
            font-weight: 600;
            color: #64748b;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 2px;
        }
        
        .info-value {
            font-weight: 600;
            color: #1e293b;
            font-size: 13px;
        }
        
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
            margin-bottom: 15px;
        }
        
        .summary-card {
            text-align: center;
            padding: 12px 8px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
        }
        
        .summary-card.normal {
            background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
            border-color: #bbf7d0;
        }
        
        .summary-card.attention {
            background: linear-gradient(135deg, #fefce8 0%, #fef3c7 100%);
            border-color: #fde047;
        }
        
        .summary-card.critical {
            background: linear-gradient(135deg, #fef2f2 0%, #fecaca 100%);
            border-color: #fca5a5;
        }
        
        .summary-card.total {
            background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
            border-color: #93c5fd;
        }
        
        .summary-number {
            font-size: 20px;
            font-weight: 700;
            margin-bottom: 4px;
        }
        
        .summary-number.normal { color: #16a34a; }
        .summary-number.attention { color: #ca8a04; }
        .summary-number.critical { color: #dc2626; }
        .summary-number.total { color: #2563eb; }
        
        .summary-label {
            font-size: 10px;
            color: #64748b;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }
        
        .recommendation-box {
            background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
            border: 2px solid #93c5fd;
            border-radius: 12px;
            padding: 16px;
            margin: 15px 0;
            position: relative;
        }
        
        .recommendation-box.urgent {
            background: linear-gradient(135deg, #fef2f2 0%, #fecaca 100%);
            border-color: #fca5a5;
        }
        
        .recommendation-box.moderate {
            background: linear-gradient(135deg, #fefce8 0%, #fef3c7 100%);
            border-color: #fde047;
        }
        
        .recommendation-header {
            display: flex;
            align-items: center;
            margin-bottom: 12px;
            flex-wrap: wrap;
            gap: 8px;
        }
        
        .urgency-badge {
            display: inline-flex;
            align-items: center;
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .urgency-badge.urgent {
            background: #dc2626;
            color: white;
        }
        
        .urgency-badge.moderate {
            background: #ca8a04;
            color: white;
        }
        
        .urgency-badge.routine {
            background: #2563eb;
            color: white;
        }
        
        .doctor-badge {
            background: white;
            color: #1e40af;
            border: 1px solid #93c5fd;
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 10px;
            font-weight: 600;
        }
        
        .timeframe-badge {
            background: rgba(34, 197, 94, 0.1);
            color: #166534;
            border: 1px solid #bbf7d0;
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 10px;
            font-weight: 600;
        }
        
        .recommendation-reason {
            background: rgba(255, 255, 255, 0.7);
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 12px;
            border-left: 3px solid #3b82f6;
        }
        
        .recommendation-reason.urgent {
            border-left-color: #dc2626;
        }
        
        .recommendation-reason.moderate {
            border-left-color: #ca8a04;
        }
        
        .next-steps {
            margin-top: 12px;
        }
        
        .next-steps-title {
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 8px;
            font-size: 13px;
            display: flex;
            align-items: center;
        }
        
        .next-steps-list {
            display: grid;
            gap: 6px;
        }
        
        .next-step {
            display: flex;
            align-items: flex-start;
            background: rgba(255, 255, 255, 0.6);
            padding: 8px 10px;
            border-radius: 6px;
            border-left: 2px solid #3b82f6;
        }
        
        .step-number {
            background: #3b82f6;
            color: white;
            border-radius: 50%;
            width: 18px;
            height: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 9px;
            font-weight: 700;
            margin-right: 8px;
            flex-shrink: 0;
            margin-top: 1px;
        }
        
        .step-text {
            font-size: 11px;
            line-height: 1.4;
            color: #374151;
        }
        
        .parameters-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 12px;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .parameters-table th,
        .parameters-table td {
            padding: 10px 8px;
            text-align: left;
            border-bottom: 1px solid #f1f5f9;
        }
        
        .parameters-table th {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            font-weight: 600;
            color: #475569;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .parameters-table td {
            font-size: 11px;
            color: #374151;
        }
        
        .parameters-table tr:last-child td {
            border-bottom: none;
        }
        
        .parameter-name {
            font-weight: 600;
            color: #1f2937;
        }
        
        .status-badge {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 10px;
            font-size: 9px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.3px;
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
        
        .severity-critical {
            background: #fecaca;
            color: #991b1b;
            font-weight: 700;
        }
        
        .severity-moderate {
            background: #fed7aa;
            color: #9a3412;
        }
        
        .severity-mild {
            background: #fef3c7;
            color: #92400e;
        }
        
        .explanation-box {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 8px;
            margin-top: 6px;
            font-size: 10px;
            line-height: 1.4;
            color: #4b5563;
        }
        
        .critical-alert {
            background: linear-gradient(135deg, #fef2f2 0%, #fecaca 100%);
            border: 2px solid #fca5a5;
            border-radius: 8px;
            padding: 12px;
            margin: 15px 0;
            text-align: center;
        }
        
        .critical-alert-title {
            color: #991b1b;
            font-weight: 700;
            font-size: 13px;
            margin-bottom: 6px;
        }
        
        .critical-alert-text {
            color: #7f1d1d;
            font-size: 11px;
            line-height: 1.4;
        }
        
        .health-tips {
            background: linear-gradient(135deg, #fefce8 0%, #fef3c7 100%);
            border: 1px solid #fde047;
            border-radius: 8px;
            padding: 12px;
            margin-top: 15px;
        }
        
        .health-tips-title {
            font-weight: 600;
            color: #92400e;
            margin-bottom: 8px;
            font-size: 12px;
        }
        
        .health-tips-list {
            font-size: 10px;
            color: #78350f;
            line-height: 1.4;
        }
        
        .health-tips-list li {
            margin-bottom: 3px;
        }
        
        .disclaimer {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border: 2px solid #fbbf24;
            border-radius: 10px;
            padding: 14px;
            margin-top: 25px;
        }
        
        .disclaimer-title {
            font-weight: 700;
            color: #92400e;
            margin-bottom: 6px;
            font-size: 12px;
        }
        
        .disclaimer-text {
            color: #78350f;
            font-size: 10px;
            line-height: 1.5;
        }
        
        .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            color: #64748b;
            font-size: 9px;
        }
        
        @media print {
            .section {
                page-break-inside: avoid;
            }
            
            .recommendation-box {
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
        <h1>🔬 LabWise AI Analysis Report</h1>
        <div class="subtitle">Comprehensive Lab Report Interpretation</div>
        <div class="date">Generated on ${currentDate}</div>
    </div>

    <div class="section">
        <div class="section-title">👤 Patient Information</div>
        <div class="patient-info">
            <div class="info-item">
                <div class="info-label">Patient Name</div>
                <div class="info-value">${data.patientInfo.name || 'Not provided'}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Age</div>
                <div class="info-value">${data.patientInfo.age || 'Not provided'}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Gender</div>
                <div class="info-value">${data.patientInfo.gender || 'Not provided'}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Report Date</div>
                <div class="info-value">${data.patientInfo.reportDate || 'Not provided'}</div>
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
        <div class="section-title">📊 Analysis Summary</div>
        <div class="summary-grid">
            <div class="summary-card normal">
                <div class="summary-number normal">${normalParameters.length}</div>
                <div class="summary-label">Normal</div>
            </div>
            <div class="summary-card attention">
                <div class="summary-number attention">${abnormalParameters.length - criticalParameters.length}</div>
                <div class="summary-label">Attention</div>
            </div>
            <div class="summary-card critical">
                <div class="summary-number critical">${criticalParameters.length}</div>
                <div class="summary-label">Critical</div>
            </div>
            <div class="summary-card total">
                <div class="summary-number total">${data.parameters.length}</div>
                <div class="summary-label">Total</div>
            </div>
        </div>
        
        <div class="recommendation-box ${data.urgency}">
            <div class="recommendation-header">
                <span class="urgency-badge ${data.urgency}">
                    ${getUrgencyIcon(data.urgency)} ${getUrgencyLabel(data.urgency)}
                </span>
                <span class="doctor-badge">👨‍⚕️ ${data.doctorType}</span>
                ${data.timeframe ? `<span class="timeframe-badge">⏰ ${data.timeframe}</span>` : ''}
            </div>
            
            <div class="recommendation-reason ${data.urgency}">
                <strong>Why this recommendation?</strong><br>
                ${data.reason || data.overallRecommendation}
            </div>
            
            ${data.nextSteps && data.nextSteps.length > 0 ? `
            <div class="next-steps">
                <div class="next-steps-title">
                    ✅ Recommended Next Steps
                </div>
                <div class="next-steps-list">
                    ${data.nextSteps.map((step, index) => `
                    <div class="next-step">
                        <div class="step-number">${index + 1}</div>
                        <div class="step-text">${step}</div>
                    </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}
        </div>
        
        ${criticalParameters.length > 0 ? `
        <div class="critical-alert">
            <div class="critical-alert-title">⚠️ CRITICAL VALUES DETECTED</div>
            <div class="critical-alert-text">
                Critical values have been identified in your lab results. Please seek immediate medical attention and do not delay in contacting your healthcare provider.
            </div>
        </div>
        ` : ''}
    </div>

    ${abnormalParameters.length > 0 ? `
    <div class="section">
        <div class="section-title">🚨 Parameters Requiring Attention</div>
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
                    <td class="parameter-name">${param.name}</td>
                    <td><strong>${param.value} ${param.unit}</strong></td>
                    <td>${param.normalRange} ${param.unit}</td>
                    <td><span class="status-badge status-${param.status}">${param.status.toUpperCase()}</span></td>
                    <td><span class="status-badge severity-${param.severity}">${param.severity.toUpperCase()}</span></td>
                </tr>
                ${param.explanation ? `
                <tr>
                    <td colspan="5">
                        <div class="explanation-box">
                            <strong>Explanation:</strong> ${param.explanation}
                        </div>
                    </td>
                </tr>
                ` : ''}
                `).join('')}
            </tbody>
        </table>
    </div>
    ` : ''}

    <div class="section">
        <div class="section-title">📋 Complete Test Results</div>
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
                    <td class="parameter-name">${param.name}</td>
                    <td><strong>${param.value} ${param.unit}</strong></td>
                    <td>${param.normalRange} ${param.unit}</td>
                    <td><span class="status-badge status-${param.status}">${param.status.toUpperCase()}</span></td>
                </tr>
                `).join('')}
            </tbody>
        </table>
    </div>

    ${data.urgency !== 'urgent' && abnormalParameters.length > 0 ? `
    <div class="health-tips">
        <div class="health-tips-title">💡 General Health Tips</div>
        <ul class="health-tips-list">
            <li>• Maintain a balanced diet rich in fruits and vegetables</li>
            <li>• Stay adequately hydrated throughout the day</li>
            <li>• Engage in regular physical activity as appropriate for your condition</li>
            <li>• Get adequate rest and manage stress levels effectively</li>
            <li>• Follow up on any prescribed medications or treatments</li>
            <li>• Keep track of symptoms and health changes</li>
        </ul>
    </div>
    ` : ''}

    <div class="disclaimer">
        <div class="disclaimer-title">⚖️ Medical Disclaimer</div>
        <div class="disclaimer-text">
            This AI-powered analysis is for educational and informational purposes only and should not replace professional medical advice, diagnosis, or treatment. 
            Always consult with qualified healthcare providers for proper medical evaluation and treatment decisions. The interpretation is based on general medical 
            knowledge and may not account for individual medical history, current medications, or specific health conditions.
        </div>
    </div>
    
    <div class="footer">
        <p><strong>LabWise AI</strong> • Advanced Lab Report Analysis • ${currentDate}</p>
        <p>For medical concerns, please consult with a qualified healthcare professional immediately</p>
    </div>
</body>
</html>`;
  }
}
