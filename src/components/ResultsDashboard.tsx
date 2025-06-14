
import { useState } from 'react';
import { ArrowLeft, Download, Share2, AlertCircle, CheckCircle, Clock, FileText, User, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import LoadingAnalysis from '@/components/LoadingAnalysis';

interface ResultsDashboardProps {
  file: File | null;
  results: any;
  isAnalyzing: boolean;
  onReset: () => void;
}

const ResultsDashboard = ({ file, results, isAnalyzing, onReset }: ResultsDashboardProps) => {
  if (isAnalyzing) {
    return <LoadingAnalysis fileName={file?.name || 'Lab Report'} />;
  }

  if (!results) {
    return null;
  }

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

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onReset} className="flex items-center">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Upload New Report
        </Button>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export PDF
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

      {/* Doctor Recommendation */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center text-blue-700">
            <Clock className="h-5 w-5 mr-2" />
            Doctor Recommendation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-blue-700 border-blue-300">
                {results.urgency === 'routine' ? 'Routine Follow-up' : 'Urgent'}
              </Badge>
              <span className="text-sm text-gray-600">•</span>
              <span className="text-sm font-medium">{results.doctorType}</span>
            </div>
            <p className="text-gray-700">
              Based on your results, we recommend scheduling a routine appointment with a {results.doctorType.toLowerCase()} 
              to discuss your report and any necessary follow-up actions.
            </p>
          </div>
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
