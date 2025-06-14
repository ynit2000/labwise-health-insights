
import { useState, useCallback } from 'react';
import { Upload, FileText, Camera, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface UploadSectionProps {
  onFileUpload: (file: File) => void;
}

const UploadSection = ({ onFileUpload }: UploadSectionProps) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    
    if (file && validateFile(file)) {
      onFileUpload(file);
    }
  }, [onFileUpload]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      onFileUpload(file);
    }
  }, [onFileUpload]);

  const validateFile = (file: File) => {
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF, JPEG, or PNG file.",
        variant: "destructive"
      });
      return false;
    }

    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 10MB.",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Upload Your Lab Report</h2>
        <p className="text-gray-600 text-lg">
          Drag and drop your lab report or click to browse. We support PDF, JPEG, and PNG files.
        </p>
      </div>

      <Card className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
        <CardContent className="p-8">
          <div
            className={`relative rounded-lg border-2 border-dashed p-12 text-center transition-colors ${
              isDragOver
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-blue-100 p-4 rounded-full">
                <Upload className="h-12 w-12 text-blue-600" />
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Drop your lab report here
                </h3>
                <p className="text-gray-600 mb-4">
                  or click to browse from your device
                </p>
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  Choose File
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-green-700">
              <FileText className="h-5 w-5 mr-2" />
              Supported Formats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• PDF documents (.pdf)</li>
              <li>• JPEG images (.jpg, .jpeg)</li>
              <li>• PNG images (.png)</li>
              <li>• Maximum file size: 10MB</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-blue-700">
              <AlertCircle className="h-5 w-5 mr-2" />
              Privacy & Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Your data is encrypted and secure</li>
              <li>• Reports processed locally when possible</li>
              <li>• No data stored without consent</li>
              <li>• HIPAA-compliant processing</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UploadSection;
