
import { PDFExportData, PDFSummaryStats } from '@/types/pdfTypes';
import { getUrgencyIcon, getUrgencyLabel } from './pdfUtilities';

export const generateHeaderSection = (currentDate: string): string => {
  return `
    <div class="header">
        <h1>🔬 LabWise AI Analysis Report</h1>
        <div class="subtitle">Comprehensive Lab Report Interpretation</div>
        <div class="date">Generated on ${currentDate}</div>
    </div>
  `;
};

export const generatePatientInfoSection = (data: PDFExportData): string => {
  return `
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
  `;
};

export const generateSummarySection = (data: PDFExportData, stats: PDFSummaryStats): string => {
  return `
    <div class="section">
        <div class="section-title">📊 Analysis Summary</div>
        <div class="summary-grid">
            <div class="summary-card normal">
                <div class="summary-number normal">${stats.normalParameters.length}</div>
                <div class="summary-label">Normal</div>
            </div>
            <div class="summary-card attention">
                <div class="summary-number attention">${stats.abnormalParameters.length - stats.criticalParameters.length}</div>
                <div class="summary-label">Attention</div>
            </div>
            <div class="summary-card critical">
                <div class="summary-number critical">${stats.criticalParameters.length}</div>
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
        
        ${stats.criticalParameters.length > 0 ? `
        <div class="critical-alert">
            <div class="critical-alert-title">⚠️ CRITICAL VALUES DETECTED</div>
            <div class="critical-alert-text">
                Critical values have been identified in your lab results. Please seek immediate medical attention and do not delay in contacting your healthcare provider.
            </div>
        </div>
        ` : ''}
    </div>
  `;
};

export const generateAbnormalParametersSection = (stats: PDFSummaryStats): string => {
  if (stats.abnormalParameters.length === 0) return '';

  return `
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
                ${stats.abnormalParameters.map(param => `
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
  `;
};

export const generateCompleteResultsSection = (data: PDFExportData): string => {
  return `
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
  `;
};

export const generateHealthTipsSection = (data: PDFExportData, stats: PDFSummaryStats): string => {
  if (data.urgency === 'urgent' || stats.abnormalParameters.length === 0) return '';

  return `
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
  `;
};

export const generateDisclaimerSection = (): string => {
  return `
    <div class="disclaimer">
        <div class="disclaimer-title">⚖️ Medical Disclaimer</div>
        <div class="disclaimer-text">
            This AI-powered analysis is for educational and informational purposes only and should not replace professional medical advice, diagnosis, or treatment. 
            Always consult with qualified healthcare providers for proper medical evaluation and treatment decisions. The interpretation is based on general medical 
            knowledge and may not account for individual medical history, current medications, or specific health conditions.
        </div>
    </div>
  `;
};

export const generateFooterSection = (currentDate: string): string => {
  return `
    <div class="footer">
        <p><strong>LabWise AI</strong> • Advanced Lab Report Analysis • ${currentDate}</p>
        <p>For medical concerns, please consult with a qualified healthcare professional immediately</p>
    </div>
  `;
};
