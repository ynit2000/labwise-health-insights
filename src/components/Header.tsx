
import { Brain, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Header = () => {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-blue-100 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-xl">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">LabWise</h1>
              <p className="text-sm text-gray-600">AI-Powered Lab Report Analyzer</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" className="text-gray-600 hover:text-blue-600">
              How it Works
            </Button>
            <Button variant="ghost" className="text-gray-600 hover:text-blue-600">
              About
            </Button>
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              Get Started
            </Button>
          </div>
          
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
