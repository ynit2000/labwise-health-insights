
import { Upload, Eye, Brain, AlertTriangle, Stethoscope, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const FeaturesSection = () => {
  const features = [
    {
      icon: Upload,
      title: "OCR Upload",
      description: "Upload PDF or image of your report. Our OCR technology extracts text automatically.",
      color: "bg-blue-500"
    },
    {
      icon: Eye,
      title: "Auto Highlight",
      description: "Automatically detects out-of-range values based on standard reference ranges.",
      color: "bg-green-500"
    },
    {
      icon: Brain,
      title: "AI Explanations",
      description: "Each abnormal parameter is explained in simple, easy-to-understand language.",
      color: "bg-purple-500"
    },
    {
      icon: AlertTriangle,
      title: "Severity Tags",
      description: "Labels findings as 'Critical', 'Mild', or 'Monitor Only' for better understanding.",
      color: "bg-orange-500"
    },
    {
      icon: Stethoscope,
      title: "Doctor Recommendations",
      description: "Suggests whether to visit a GP, specialist, or seek emergency care.",
      color: "bg-red-500"
    },
    {
      icon: TrendingUp,
      title: "Trend Analysis",
      description: "Track your health parameters over time and identify concerning patterns.",
      color: "bg-indigo-500"
    }
  ];

  return (
    <div className="bg-white py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Powerful Features for Better Health Understanding
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Our AI-powered platform makes complex medical reports simple to understand
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105">
              <CardHeader className="text-center pb-4">
                <div className={`${feature.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl text-gray-900">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-gray-600 leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturesSection;
