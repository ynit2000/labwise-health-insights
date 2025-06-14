
import { useState } from 'react';
import { Upload, FileText, Brain, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import UploadSection from '@/components/UploadSection';
import ResultsDashboard from '@/components/ResultsDashboard';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';

const Index = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileUpload = async (file: File) => {
    setUploadedFile(file);
    setIsAnalyzing(true);
    
    // Simulate OCR and analysis process
    setTimeout(() => {
      // Mock analysis results based on the uploaded lab report
      const mockResults = {
        patientInfo: {
          name: "Sample Patient",
          age: "26 YRS",
          gender: "M",
          reportDate: "03/03/2025"
        },
        parameters: [
          {
            name: "Hemoglobin",
            value: 15,
            unit: "g/dl",
            normalRange: "13 - 17",
            status: "normal",
            severity: "normal",
            explanation: "Your hemoglobin level is within the normal range, indicating healthy oxygen-carrying capacity in your blood."
          },
          {
            name: "Lymphocyte",
            value: 18,
            unit: "%",
            normalRange: "20 - 40",
            status: "low",
            severity: "mild",
            explanation: "Your lymphocyte percentage is slightly below normal. This could indicate a recent infection or immune system stress. Consider monitoring and consult your doctor if you have symptoms."
          },
          {
            name: "Monocytes",
            value: 1,
            unit: "%",
            normalRange: "2 - 10",
            status: "low",
            severity: "mild",
            explanation: "Slightly low monocyte count. This is usually not concerning but worth monitoring in follow-up tests."
          },
          {
            name: "Mean Cell Haemoglobin Con, MCHC",
            value: 35.7,
            unit: "%",
            normalRange: "31.5 - 34.5",
            status: "high",
            severity: "monitor",
            explanation: "Slightly elevated MCHC may indicate dehydration or certain blood disorders. Ensure adequate hydration and follow up with your doctor."
          }
        ],
        overallRecommendation: "Most parameters are within normal limits. Monitor the slightly abnormal values and consider follow-up testing in 3-6 months or as advised by your physician.",
        urgency: "routine",
        doctorType: "General Physician"
      };
      
      setAnalysisResults(mockResults);
      setIsAnalyzing(false);
    }, 3000);
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
