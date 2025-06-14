
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Key, Eye, EyeOff, ExternalLink } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ocrApiService } from '@/services/ocrApiService';

interface ApiKeyConfigProps {
  onApiKeySet: (apiKey: string) => void;
  hasApiKey: boolean;
}

const ApiKeyConfig = ({ onApiKeySet, hasApiKey }: ApiKeyConfigProps) => {
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your OCR API key",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Validate API key before setting it
      const validation = await ocrApiService.validateApiKey(apiKey.trim());
      
      if (!validation.isValid) {
        toast({
          title: "Invalid API Key",
          description: validation.error || "Please check your OCR.space API key and try again.",
          variant: "destructive"
        });
        return;
      }
      
      // Store API key in localStorage for this session
      localStorage.setItem('ocr_api_key', apiKey.trim());
      onApiKeySet(apiKey.trim());
      
      toast({
        title: "API Key Set Successfully",
        description: "You can now upload and analyze lab reports",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to validate API key. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (hasApiKey) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center text-green-700">
            <Key className="h-5 w-5 mr-2" />
            <span>OCR API Key is configured and ready to use</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center text-xl">
          <Key className="h-5 w-5 mr-2 text-blue-600" />
          Configure OCR API Key
        </CardTitle>
        <CardDescription>
          Enter your OCR.space API key to enable advanced document scanning.{' '}
          <a 
            href="https://ocr.space/ocrapi" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            Get your free API key <ExternalLink className="h-4 w-4 ml-1" />
          </a>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="apiKey" className="text-sm font-medium">OCR API Key</Label>
            <div className="relative mt-1">
              <Input
                id="apiKey"
                type={showApiKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your OCR.space API key"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          <Button type="submit" disabled={isLoading} className="w-full bg-slate-800 hover:bg-slate-700">
            {isLoading ? 'Setting up...' : 'Set API Key'}
          </Button>
          
          <div className="text-xs text-gray-600 bg-yellow-50 p-3 rounded-lg">
            <p className="font-medium mb-1 flex items-center">
              🔒 Privacy Note:
            </p>
            <p>Your API key is stored locally in your browser and is never sent to our servers.</p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ApiKeyConfig;
