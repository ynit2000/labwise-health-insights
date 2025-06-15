
import { useState, useEffect, useRef } from 'react';
import { Upload, FileText, Brain, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import UploadSection from '@/components/UploadSection';
import ResultsDashboard from '@/components/ResultsDashboard';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import ApiKeyConfig from '@/components/ApiKeyConfig';
import { ocrApiService } from '@/services/ocrApiService';
import { ExtractedData } from '@/types/ocrTypes';
import { aiExplanationService } from '@/services/aiExplanationService';
import { toast } from '@/hooks/use-toast';

const DEFAULT_OCR_API_KEY = "K88990872588957";

const Index = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  // Default: always true (we now always have an API key for new users)
  const [hasApiKey, setHasApiKey] = useState(true);
  // Track if user wants to "change" key (not shown by default)
  const [showApiKeyConfig, setShowApiKeyConfig] = useState(false);

  const uploadSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // On mount, check key
    const savedApiKey = localStorage.getItem('ocr_api_key');
    if (!savedApiKey) {
      // If no key, pre-fill with default and mark as set
      localStorage.setItem('ocr_api_key', DEFAULT_OCR_API_KEY);
      ocrApiService.setApiKey(DEFAULT_OCR_API_KEY);
      setHasApiKey(true);
    } else {
      ocrApiService.setApiKey(savedApiKey);
      setHasApiKey(true);
    }
  }, []);

  const handleApiKeySet = (apiKey: string) => {
    ocrApiService.setApiKey(apiKey);
    setHasApiKey(true);
    setShowApiKeyConfig(false);
  };

  const handleFileUpload = async (file: File) => {
    if (!hasApiKey) {
      toast({
        title: "API Key Required",
        description: "Please configure your OCR API key first",
        variant: "destructive"
      });
      return;
    }

    setUploadedFile(file);
    setIsAnalyzing(true);

    try {
      console.log('Starting file analysis for:', file.name);
      const extractedText = await ocrApiService.extractTextFromFile(file);
      console.log('OCR API completed, extracted text length:', extractedText.length);

      const extractedData: ExtractedData = ocrApiService.parseLabReport(extractedText);
      console.log('Lab report parsed:', extractedData);

      const enhancedParameters = extractedData.parameters.map(param => ({
        ...param,
        explanation: aiExplanationService.generateExplanation(
          param.name, 
          param.status, 
          typeof param.value === 'number' ? param.value : 0, 
          param.normalRange
        )
      }));

      const doctorRecommendation = aiExplanationService.generateDoctorRecommendation(enhancedParameters);

      const results = {
        patientInfo: extractedData.patientInfo,
        parameters: enhancedParameters,
        overallRecommendation: doctorRecommendation.reason,
        urgency: doctorRecommendation.urgency,
        doctorType: doctorRecommendation.specialty,
        timeframe: doctorRecommendation.timeframe,
        nextSteps: doctorRecommendation.nextSteps,
        reason: doctorRecommendation.reason
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
        description: error.message || "Unable to extract data from the file. Please ensure the image is clear and try again.",
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

  // Scroll handler to go to upload box
  const scrollToUploadSection = () => {
    if (uploadSectionRef.current) {
      uploadSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Header />

      {!uploadedFile && !analysisResults && (
        <>
          <HeroSection onUploadClick={scrollToUploadSection} />
          <FeaturesSection />
        </>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Show API Key Config only if user explicitly requests it */}
        {showApiKeyConfig && (
          <div className="max-w-2xl mx-auto mb-8">
            <ApiKeyConfig onApiKeySet={handleApiKeySet} hasApiKey={hasApiKey} />
          </div>
        )}

        {!showApiKeyConfig && hasApiKey && !uploadedFile && !analysisResults && (
          <div ref={uploadSectionRef}>
            <UploadSection onFileUpload={handleFileUpload} />
            {/* Option to change API key if desired */}
            <div className="mt-4 flex justify-end">
              <Button 
                variant="link" 
                className="text-xs text-gray-500 underline" 
                onClick={() => setShowApiKeyConfig(true)}
              >
                Change OCR API Key
              </Button>
            </div>
          </div>
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

