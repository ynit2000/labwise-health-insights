
import { StructuredRecommendation, DoctorRecommendation } from '@/types/explanationTypes';
import { ExtractedData } from '@/types/ocrTypes';

export class AdvancedMedicalRecommendationService {
  
  generateStructuredRecommendation(data: ExtractedData): StructuredRecommendation {
    const abnormalParams = data.parameters.filter(p => p.status !== 'normal');
    const criticalParams = abnormalParams.filter(p => p.severity === 'critical');
    const urgentParams = abnormalParams.filter(p => p.severity === 'moderate');
    
    // Determine overall urgency
    let urgencyLevel: 'critical' | 'urgent' | 'moderate' | 'routine' = 'routine';
    if (criticalParams.length > 0) urgencyLevel = 'critical';
    else if (urgentParams.length > 2) urgencyLevel = 'urgent';
    else if (abnormalParams.length > 0) urgencyLevel = 'moderate';

    return {
      patientSummary: {
        name: data.patientInfo.name,
        age: parseInt(data.patientInfo.age) || 0,
        gender: data.patientInfo.gender,
        reportsAnalyzed: ['Complete Blood Count', 'Basic Metabolic Panel']
      },
      keyAbnormalities: this.identifyKeyAbnormalities(abnormalParams),
      specificRecommendations: this.generateSpecificRecommendations(abnormalParams, urgencyLevel),
      generalRecommendationsByCondition: this.generateConditionBasedRecommendations(abnormalParams),
      criticalNotes: this.generateCriticalNotes(abnormalParams),
      urgencyLevel
    };
  }

  private identifyKeyAbnormalities(abnormalParams: any[]) {
    return abnormalParams.map(param => ({
      testName: param.name,
      result: `${param.value} ${param.unit}`,
      clinicalSignificance: this.getClinicalSignificance(param.name, param.status, param.value),
      severity: this.mapSeverity(param.severity)
    }));
  }

  private getClinicalSignificance(paramName: string, status: string, value: number): string {
    const significanceMap: Record<string, Record<string, string>> = {
      'Hemoglobin': {
        'low': 'Indicates anemia, may cause fatigue and reduced oxygen delivery',
        'high': 'May indicate dehydration or polycythemia, increases blood viscosity'
      },
      'Glucose': {
        'high': 'Suggests diabetes or prediabetes, increases cardiovascular risk',
        'low': 'May cause hypoglycemic symptoms, requires immediate attention'
      },
      'Creatinine': {
        'high': 'Indicates reduced kidney function, may require nephrology consultation'
      },
      'Cholesterol': {
        'high': 'Increases cardiovascular disease risk, lifestyle modification needed'
      },
      'White Blood Cell': {
        'high': 'May indicate infection, inflammation, or hematologic disorder',
        'low': 'Suggests immunosuppression or bone marrow dysfunction'
      }
    };

    return significanceMap[paramName]?.[status] || `${status} ${paramName} requires clinical evaluation`;
  }

  private generateSpecificRecommendations(abnormalParams: any[], urgencyLevel: string): string[] {
    const recommendations: string[] = [];

    abnormalParams.forEach(param => {
      const paramRecommendations = this.getParameterSpecificRecommendations(param);
      recommendations.push(...paramRecommendations);
    });

    // Add urgency-based recommendations
    if (urgencyLevel === 'critical') {
      recommendations.unshift('Seek immediate medical attention within 24 hours');
      recommendations.push('Contact emergency services if symptoms worsen');
    } else if (urgencyLevel === 'urgent') {
      recommendations.unshift('Schedule appointment with healthcare provider within 48-72 hours');
    }

    return [...new Set(recommendations)]; // Remove duplicates
  }

  private getParameterSpecificRecommendations(param: any): string[] {
    const recommendationMap: Record<string, Record<string, string[]>> = {
      'Hemoglobin': {
        'low': [
          'Iron supplementation as recommended by physician',
          'Increase iron-rich foods (spinach, red meat, beans)',
          'Vitamin C supplementation to enhance iron absorption',
          'Follow-up CBC in 4-6 weeks'
        ],
        'high': [
          'Increase fluid intake',
          'Monitor blood pressure regularly',
          'Avoid smoking and alcohol',
          'Consider phlebotomy if indicated'
        ]
      },
      'Glucose': {
        'high': [
          'Initiate or adjust diabetes medication as prescribed',
          'Monitor blood glucose levels daily',
          'Dietary consultation for carbohydrate management',
          'Regular exercise as tolerated',
          'HbA1c testing in 3 months'
        ],
        'low': [
          'Carry glucose tablets or quick-acting carbohydrates',
          'Eat regular meals with complex carbohydrates',
          'Monitor blood glucose before driving',
          'Review diabetes medications with physician'
        ]
      },
      'Creatinine': {
        'high': [
          'Nephrology consultation if GFR <60',
          'Monitor blood pressure closely',
          'Avoid nephrotoxic medications (NSAIDs)',
          'Protein restriction if indicated',
          'Repeat kidney function tests in 2-4 weeks'
        ]
      }
    };

    return recommendationMap[param.name]?.[param.status] || [`Monitor ${param.name} levels closely`];
  }

  private generateConditionBasedRecommendations(abnormalParams: any[]): Record<string, string[]> {
    const conditions: Record<string, string[]> = {};

    // Detect diabetes indicators
    const diabetesParams = abnormalParams.filter(p => 
      p.name.toLowerCase().includes('glucose') || p.name.toLowerCase().includes('hba1c')
    );
    if (diabetesParams.length > 0) {
      conditions['Diabetes Management'] = [
        'Annual diabetic eye examination',
        'Foot care and daily inspection',
        'Blood pressure monitoring',
        'Lipid profile every 6 months',
        'Kidney function monitoring'
      ];
    }

    // Detect anemia indicators
    const anemiaParams = abnormalParams.filter(p => 
      p.name.toLowerCase().includes('hemoglobin') && p.status === 'low'
    );
    if (anemiaParams.length > 0) {
      conditions['Anemia Management'] = [
        'Iron studies if not already done',
        'B12 and folate levels',
        'Stool occult blood test',
        'Dietary iron supplementation',
        'Monitor for underlying causes'
      ];
    }

    // Detect cardiovascular risk
    const cvParams = abnormalParams.filter(p => 
      p.name.toLowerCase().includes('cholesterol') || 
      p.name.toLowerCase().includes('ldl') ||
      p.name.toLowerCase().includes('hdl')
    );
    if (cvParams.length > 0) {
      conditions['Cardiovascular Risk'] = [
        'Low saturated fat diet',
        'Regular aerobic exercise',
        'Smoking cessation if applicable',
        'Blood pressure monitoring',
        'Consider statin therapy'
      ];
    }

    return conditions;
  }

  private generateCriticalNotes(abnormalParams: any[]): string[] {
    const notes: string[] = [
      'All recommendations should be correlated with clinical symptoms and patient history',
      'Repeat abnormal tests to confirm results before major treatment changes',
      'Consider medication interactions and patient allergies before prescribing'
    ];

    // Add parameter-specific critical notes
    abnormalParams.forEach(param => {
      if (param.name.toLowerCase().includes('creatinine') && param.status === 'high') {
        notes.push('Creatinine elevation may affect drug dosing - adjust medications as needed');
      }
      if (param.name.toLowerCase().includes('glucose') && param.severity === 'critical') {
        notes.push('Severe hyperglycemia may indicate diabetic ketoacidosis - check ketones');
      }
      if (param.name.toLowerCase().includes('hemoglobin') && param.severity === 'critical') {
        notes.push('Severe anemia may require blood transfusion - assess symptoms urgently');
      }
    });

    return [...new Set(notes)];
  }

  private mapSeverity(severity: string): 'critical' | 'urgent' | 'moderate' | 'routine' {
    switch (severity) {
      case 'critical': return 'critical';
      case 'moderate': return 'urgent';
      case 'mild': return 'moderate';
      default: return 'routine';
    }
  }

  generateEnhancedDoctorRecommendation(data: ExtractedData): DoctorRecommendation {
    const structured = this.generateStructuredRecommendation(data);
    const abnormalCount = data.parameters.filter(p => p.status !== 'normal').length;
    
    let specialty = 'General Physician';
    let severity: 'low' | 'moderate' | 'high' | 'critical' = 'low';
    
    // Determine specialty based on abnormalities
    const hasKidneyIssues = data.parameters.some(p => 
      p.name.toLowerCase().includes('creatinine') && p.status !== 'normal'
    );
    const hasDiabetes = data.parameters.some(p => 
      p.name.toLowerCase().includes('glucose') && p.status !== 'normal'
    );
    const hasBloodIssues = data.parameters.some(p => 
      p.name.toLowerCase().includes('hemoglobin') && p.status !== 'normal'
    );

    if (hasKidneyIssues) specialty = 'Nephrologist';
    else if (hasDiabetes) specialty = 'Endocrinologist';
    else if (hasBloodIssues) specialty = 'Hematologist';

    // Map urgency to severity
    switch (structured.urgencyLevel) {
      case 'critical': severity = 'critical'; break;
      case 'urgent': severity = 'high'; break;
      case 'moderate': severity = 'moderate'; break;
      default: severity = 'low';
    }

    return {
      specialty,
      urgency: structured.urgencyLevel,
      severity,
      reason: this.generateDetailedReason(structured),
      timeframe: this.getTimeframe(structured.urgencyLevel),
      nextSteps: structured.specificRecommendations.slice(0, 5),
      immediateActions: this.getImmediateActions(structured.urgencyLevel, structured.keyAbnormalities),
      investigations: this.getRecommendedInvestigations(structured.keyAbnormalities),
      lifestyleAdjustments: this.getLifestyleRecommendations(structured.keyAbnormalities),
      patientEducation: this.getPatientEducationPoints(structured.keyAbnormalities)
    };
  }

  private generateDetailedReason(structured: StructuredRecommendation): string {
    const abnormalCount = structured.keyAbnormalities.length;
    const criticalCount = structured.keyAbnormalities.filter(a => a.severity === 'critical').length;
    
    if (criticalCount > 0) {
      return `Critical abnormalities detected in ${criticalCount} parameter(s). Immediate medical evaluation required to prevent complications.`;
    } else if (abnormalCount > 3) {
      return `Multiple parameters (${abnormalCount}) are outside normal range, suggesting systemic involvement requiring comprehensive evaluation.`;
    } else if (abnormalCount > 0) {
      return `${abnormalCount} parameter(s) need attention. Early intervention can prevent progression to more serious conditions.`;
    } else {
      return 'All parameters within normal limits. Continue current health maintenance practices.';
    }
  }

  private getTimeframe(urgency: string): string {
    switch (urgency) {
      case 'critical': return 'Within 24 hours';
      case 'urgent': return 'Within 48-72 hours';
      case 'moderate': return 'Within 1-2 weeks';
      default: return 'Within 4-6 weeks';
    }
  }

  private getImmediateActions(urgency: string, abnormalities: any[]): string[] {
    const actions: string[] = [];
    
    if (urgency === 'critical') {
      actions.push('Contact healthcare provider immediately');
      actions.push('Monitor symptoms closely');
      actions.push('Have emergency contact information ready');
    }
    
    abnormalities.forEach(abnormality => {
      if (abnormality.severity === 'critical') {
        if (abnormality.testName.toLowerCase().includes('glucose')) {
          actions.push('Check blood glucose levels frequently');
        }
        if (abnormality.testName.toLowerCase().includes('hemoglobin')) {
          actions.push('Monitor for signs of severe anemia (dizziness, shortness of breath)');
        }
      }
    });
    
    return [...new Set(actions)];
  }

  private getRecommendedInvestigations(abnormalities: any[]): string[] {
    const investigations: string[] = [];
    
    abnormalities.forEach(abnormality => {
      const testName = abnormality.testName.toLowerCase();
      
      if (testName.includes('glucose')) {
        investigations.push('HbA1c if not done recently');
        investigations.push('Fasting glucose confirmation');
      }
      if (testName.includes('creatinine')) {
        investigations.push('Complete metabolic panel');
        investigations.push('Urinalysis');
      }
      if (testName.includes('hemoglobin')) {
        investigations.push('Iron studies (ferritin, TIBC, transferrin saturation)');
        investigations.push('B12 and folate levels');
      }
    });
    
    return [...new Set(investigations)];
  }

  private getLifestyleRecommendations(abnormalities: any[]): string[] {
    const recommendations: string[] = [
      'Maintain balanced diet with adequate hydration',
      'Regular physical activity as appropriate for age and condition',
      'Adequate sleep (7-9 hours nightly)',
      'Stress management techniques'
    ];
    
    abnormalities.forEach(abnormality => {
      const testName = abnormality.testName.toLowerCase();
      
      if (testName.includes('glucose')) {
        recommendations.push('Carbohydrate counting and portion control');
        recommendations.push('Regular meal timing');
      }
      if (testName.includes('cholesterol')) {
        recommendations.push('Low saturated fat diet');
        recommendations.push('Increase omega-3 fatty acids');
      }
    });
    
    return [...new Set(recommendations)];
  }

  private getPatientEducationPoints(abnormalities: any[]): string[] {
    const points: string[] = [
      'Understand the importance of medication compliance',
      'Recognize warning signs that require immediate medical attention',
      'Keep a health diary tracking symptoms and measurements'
    ];
    
    abnormalities.forEach(abnormality => {
      const testName = abnormality.testName.toLowerCase();
      
      if (testName.includes('glucose')) {
        points.push('Learn proper blood glucose monitoring technique');
        points.push('Understand signs of hypoglycemia and hyperglycemia');
      }
      if (testName.includes('hemoglobin')) {
        points.push('Recognize symptoms of anemia (fatigue, weakness, pale skin)');
      }
    });
    
    return [...new Set(points)];
  }
}

export const advancedMedicalRecommendationService = new AdvancedMedicalRecommendationService();
