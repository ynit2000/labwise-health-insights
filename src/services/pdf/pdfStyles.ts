
export const getPDFStyles = (): string => {
  return `
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
    `;
};
