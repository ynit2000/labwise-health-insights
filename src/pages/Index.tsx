
import { useState } from 'react';
import { Upload, FileText, Brain, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import UploadSection from '@/components/UploadSection';
import ResultsDashboard from '@/components/ResultsDashboard';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import { ocrService, ExtractedData } from '@/services/ocrService';
import { aiExplanationService } from '@/services/aiExplanationService';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileUpload = async (file: File) => {
    setUploadedFile(file);
    setIsAnalyzing(true);
    
    try {
      console.log('Starting file analysis for:', file.name);
      
      // Extract text using OCR
      const extractedText = await ocrService.extractTextFromFile(file);
      console.log('OCR completed, extracted text length:', extractedText.length);
      
      // Parse the lab report data
      const extractedData: ExtractedData = ocrService.parseLabReport(extractedText);
      console.log('Lab report parsed:', extractedData);
      
      // Enhance parameters with AI explanations
      const enhancedParameters = extractedData.parameters.map(param => ({
        ...param,
        explanation: aiExplanationService.generateExplanation(
          param.name, 
          param.status, 
          typeof param.value === 'number' ? param.value : 0, 
          param.normalRange
        )
      }));
      
      // Generate overall recommendations
      const abnormalParams = enhancedParameters.filter(p => p.status !== 'normal');
      const criticalParams = abnormalParams.filter(p => p.severity === 'critical');
      
      let overallRecommendation = '';
      let urgency = 'routine';
      let doctorType = 'General Physician';
      
      if (criticalParams.length > 0) {
        overallRecommendation = 'Critical values detected. Immediate medical attention recommended.';
        urgency = 'urgent';
        doctorType = 'Emergency Care';
      } else if (abnormalParams.length > 3) {
        overallRecommendation = 'Multiple parameters are outside normal range. Schedule an appointment with your doctor for comprehensive evaluation.';
        urgency = 'moderate';
        doctorType = 'General Physician';
      } else if (abnormalParams.length > 0) {
        overallRecommendation = 'Some parameters need attention. Monitor these values and consult your doctor if symptoms develop.';
        urgency = 'routine';
        doctorType = 'General Physician';
      } else {
        overallRecommendation = 'All parameters are within normal limits. Continue maintaining a healthy lifestyle.';
        urgency = 'routine';
        doctorType = 'General Physician';
      }
      
      const results = {
        patientInfo: extractedData.patientInfo,
        parameters: enhancedParameters,
        overallRecommendation,
        urgency,
        doctorType
      };
      
      setAnalysisResults(results);
      
      toast({
        title: "Analysis Complete",
        description: `Successfully extracted ${enhancedParameters.length} parameters from your lab report.`,
      });
      
    } catch (error) {
      console.error('Analysis failed:', error);
      toast({
        title: "Analysis Failed",
        description: "Unable to extract data from the file. Please ensure the image is clear and try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setUploadedFile(null);
    setAnalysisResults(null);
    setIsAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Header />
      
      {!uploadedFile && !analysisResults && (
        <>
          <HeroSection />
          <FeaturesSection />
        </>
      )}
      
      <div className="container mx-auto px-4 py-8">
        {!uploadedFile && !analysisResults && (
          <UploadSection onFileUpload={handleFileUpload} />
        )}
        
        {(uploadedFile || analysisResults) && (
          <ResultsDashboard 
            file={uploadedFile}
            results={analysisResults}
            isAnalyzing={isAnalyzing}
            onReset={resetAnalysis}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
