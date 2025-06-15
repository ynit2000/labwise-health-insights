import { useState } from 'react';
import { ArrowLeft, Download, Share2, AlertCircle, CheckCircle, Clock, FileText, User, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import LoadingAnalysis from '@/components/LoadingAnalysis';
import { PDFExportService } from '@/services/pdfExportService';

interface ResultsDashboardProps {
  file: File | null;
  results: any;
  isAnalyzing: boolean;
  onReset: () => void;
}

const getRecommendationTitle = (urgency: string, specialty?: string) => {
  switch (urgency) {
    case 'critical':
      return `Emergency: Immediate Medical Attention Required${specialty ? ` (${specialty})` : ''}`;
    case 'urgent':
      return `${specialty || 'Doctor'} Referral - Urgent`;
    case 'moderate':
      return `Follow-Up: ${specialty || 'Doctor'} (Moderate Priority)`;
    default:
      return `Routine Follow-Up with ${specialty || 'General Physician'}`;
  }
};

const getUrgencyColor = (urgency: string) => {
  switch (urgency) {
    case 'critical':
    case 'urgent':
      return 'text-red-700 border-l-red-500';
    case 'moderate':
      return 'text-orange-700 border-l-orange-500';
    default:
      return 'text-blue-700 border-l-blue-500';
  }
};

const getUrgencyBadge = (urgency: string) => {
  switch (urgency) {
    case 'critical':
      return (
        <Badge className="bg-red-100 text-red-700 border-red-200">
          🚨 Emergency
        </Badge>
      );
    case 'urgent':
      return (
        <Badge className="bg-red-100 text-red-700 border-red-200">
          🔴 Urgent
        </Badge>
      );
    case 'moderate':
      return (
        <Badge className="bg-orange-100 text-orange-700 border-orange-200">
          ⚠️ Moderate Priority
        </Badge>
      );
    default:
      return (
        <Badge className="bg-blue-100 text-blue-700 border-blue-200">
          📅 Routine
        </Badge>
      );
  }
};

const ResultsDashboard = ({ file, results, isAnalyzing, onReset }: ResultsDashboardProps) => {
  const [isExporting, setIsExporting] = useState(false);

  if (isAnalyzing) {
    return <LoadingAnalysis fileName={file?.name || 'Lab Report'} />;
  }

  if (!results) {
    return null;
  }

  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      
      const exportData = {
        patientInfo: results.patientInfo,
        parameters: results.parameters,
        overallRecommendation: results.overallRecommendation,
        urgency: results.urgency,
        doctorType: results.doctorType
      };
      
      const fileName = `lab-report-${results.patientInfo.name.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
      
      await PDFExportService.exportToPDF(exportData, fileName);
      
      toast({
        title: "PDF Export Successful",
        description: "Your lab report has been prepared for download.",
      });
      
    } catch (error) {
      console.error('PDF export failed:', error);
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export PDF. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'moderate':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'mild':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'monitor':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'high':
      case 'low':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  const abnormalParameters = results.parameters.filter((param: any) => param.status !== 'normal');
  const normalParameters = results.parameters.filter((param: any) => param.status === 'normal');

  const recUrgency = results.urgency || 'routine';
  const recSpecialty = results.doctorType || 'General Physician';
  const recTitle = getRecommendationTitle(recUrgency, recSpecialty);
  const urgencyClass = getUrgencyColor(recUrgency);
  const urgencyBadge = getUrgencyBadge(recUrgency);
  const timeframe = results.timeframe || (
    recUrgency === 'critical' ? 'Within 24 hours' :
    recUrgency === 'urgent' ? 'Within 24-48 hours' :
    recUrgency === 'moderate' ? 'Within 1-2 weeks' :
    'Within 4-6 weeks'
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onReset} className="flex items-center">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Upload New Report
        </Button>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExportPDF}
            disabled={isExporting}
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? 'Preparing PDF...' : 'Export PDF'}
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Patient Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2 text-blue-600" />
            Patient Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-semibold">{results.patientInfo.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Age</p>
              <p className="font-semibold">{results.patientInfo.age}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Gender</p>
              <p className="font-semibold">{results.patientInfo.gender}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Report Date</p>
              <p className="font-semibold">{results.patientInfo.reportDate}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overall Summary */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="text-blue-700">Analysis Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{normalParameters.length}</div>
              <div className="text-sm text-green-700">Normal Parameters</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{abnormalParameters.length}</div>
              <div className="text-sm text-yellow-700">Need Attention</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{results.parameters.length}</div>
              <div className="text-sm text-blue-700">Total Parameters</div>
            </div>
          </div>
          
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Recommendation:</strong> {results.overallRecommendation}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Abnormal Parameters */}
      {abnormalParameters.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-orange-700">
              <AlertCircle className="h-5 w-5 mr-2" />
              Parameters Requiring Attention
            </CardTitle>
            <CardDescription>
              These values are outside the normal range and may need follow-up
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {abnormalParameters.map((param: any, index: number) => (
              <Card key={index} className="border-l-4 border-l-orange-400">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-semibold text-lg">{param.name}</h4>
                        <Badge className={getSeverityColor(param.severity)}>
                          {param.severity}
                        </Badge>
                        <Badge variant="outline" className="flex items-center">
                          {getStatusIcon(param.status)}
                          <span className="ml-1 capitalize">{param.status}</span>
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Value:</span> {param.value} {param.unit} 
                        <span className="ml-4"><span className="font-medium">Normal Range:</span> {param.normalRange} {param.unit}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm leading-relaxed">{param.explanation}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Normal Parameters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-green-700">
            <CheckCircle className="h-5 w-5 mr-2" />
            Normal Parameters
          </CardTitle>
          <CardDescription>
            These values are within healthy ranges
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {normalParameters.map((param: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium">{param.name}</p>
                  <p className="text-sm text-gray-600">{param.value} {param.unit}</p>
                </div>
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Doctor Recommendation */}
      <Card className={`border-l-4 ${urgencyClass}`}>
        <CardHeader>
          <CardTitle className={`flex items-center ${urgencyClass}`}>
            <AlertCircle className="h-5 w-5 mr-2" />
            <span className="ml-2">{recTitle}</span>
          </CardTitle>
          <CardDescription>
            Personalized healthcare guidance based on your lab results
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Urgency and Specialty */}
          <div className="flex flex-wrap items-center gap-3">
            {urgencyBadge}
            <Badge variant="outline" className="text-blue-700 border-blue-300">
              <User className="h-3 w-3 mr-1" />
              {recSpecialty}
            </Badge>
            <Badge variant="outline" className="text-green-700 border-green-300">
              <Calendar className="h-3 w-3 mr-1" />
              {timeframe}
            </Badge>
          </div>

          {/* Recommendation Reason */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">Why this recommendation?</h4>
            <p className="text-gray-700 leading-relaxed">
              {results.reason || results.overallRecommendation}
            </p>
          </div>

          {/* Next Steps */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
              Recommended Next Steps
            </h4>
            <div className="space-y-2">
              {(results.nextSteps || [
                'Schedule an appointment with your healthcare provider',
                'Bring your complete lab report to the appointment',
                'Prepare a list of any symptoms or health concerns',
                'Continue following any current treatment plans'
              ]).map((step: string, index: number) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-700">
                    {index + 1}
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Information */}
          {recUrgency === 'critical' && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Important:</strong> Critical values have been detected. Please seek immediate medical attention and do not delay in contacting your healthcare provider.
              </AlertDescription>
            </Alert>
          )}

          {recUrgency !== 'critical' && abnormalParameters.length > 0 && (
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h5 className="font-medium text-yellow-800 mb-2">General Health Tips:</h5>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Maintain a balanced diet rich in fruits and vegetables</li>
                <li>• Stay adequately hydrated throughout the day</li>
                <li>• Engage in regular physical activity as appropriate</li>
                <li>• Get adequate rest and manage stress levels</li>
                <li>• Follow up on any prescribed medications or treatments</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Medical Disclaimer:</strong> This analysis is for educational purposes only and should not replace professional medical advice. 
          Always consult with your healthcare provider for proper diagnosis and treatment.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default ResultsDashboard;
