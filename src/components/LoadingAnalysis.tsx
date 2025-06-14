
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { FileText, Brain, Eye, Stethoscope, Scan } from 'lucide-react';

interface LoadingAnalysisProps {
  fileName: string;
}

const LoadingAnalysis = ({ fileName }: LoadingAnalysisProps) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { icon: Scan, label: "Connecting to OCR API", description: "Establishing secure connection to OCR.space API service" },
    { icon: Eye, label: "Processing with advanced OCR", description: "Extracting text from your lab report with high accuracy" },
    { icon: Brain, label: "Analyzing lab parameters", description: "Parsing and identifying lab values and normal ranges" },
    { icon: Stethoscope, label: "Generating health insights", description: "Creating personalized explanations and recommendations" }
  ];

  useEffect(() => {
    // More aggressive progress updates
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        const increment = Math.random() * 15 + 8; // Faster progress increments
        return Math.min(prev + increment, 100);
      });
    }, 200); // Faster updates

    // Faster step transitions
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) return prev + 1;
        return prev;
      });
    }, 800); // Faster step transitions

    return () => {
      clearInterval(interval);
      clearInterval(stepInterval);
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-blue-900 mb-2 flex items-center justify-center">
            <Scan className="mr-3 h-8 w-8 animate-pulse" />
            Analyzing Your Lab Report
          </CardTitle>
          <p className="text-blue-700">
            Processing: <span className="font-semibold">{fileName}</span>
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex justify-between text-sm text-blue-700 mb-2">
              <span>Analysis Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>

          <div className="space-y-4">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              
              return (
                <div
                  key={index}
                  className={`flex items-center p-4 rounded-lg transition-all duration-300 ${
                    isActive
                      ? 'bg-blue-100 border-l-4 border-l-blue-500 shadow-md transform scale-105'
                      : isCompleted
                      ? 'bg-green-50 border-l-4 border-l-green-500'
                      : 'bg-gray-50 border-l-4 border-l-gray-300'
                  }`}
                >
                  <div
                    className={`p-2 rounded-full mr-4 ${
                      isActive
                        ? 'bg-blue-500 text-white'
                        : isCompleted
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    <StepIcon className={`h-5 w-5 ${isActive ? 'animate-pulse' : ''}`} />
                  </div>
                  <div className="flex-1">
                    <h4
                      className={`font-medium ${
                        isActive ? 'text-blue-900' : isCompleted ? 'text-green-900' : 'text-gray-600'
                      }`}
                    >
                      {step.label}
                    </h4>
                    <p
                      className={`text-sm ${
                        isActive ? 'text-blue-700' : isCompleted ? 'text-green-700' : 'text-gray-500'
                      }`}
                    >
                      {step.description}
                    </p>
                  </div>
                  {isActive && (
                    <div className="ml-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="text-center text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
            <p>🔒 Your report is being processed securely and will not be stored without your permission.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoadingAnalysis;
