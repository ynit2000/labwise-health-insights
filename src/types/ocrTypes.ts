
export interface OCRApiResponse {
  ParsedResults: Array<{
    TextOverlay: {
      Lines: Array<{
        LineText: string;
        Words: Array<{
          WordText: string;
          Left: number;
          Top: number;
          Height: number;
          Width: number;
        }>;
      }>;
    };
    TextOrientation: string;
    FileParseExitCode: number;
    ParsedText: string;
    ErrorMessage: string;
    ErrorDetails: string;
  }>;
  OCRExitCode: number;
  IsErroredOnProcessing: boolean;
  ProcessingTimeInMilliseconds: string;
  SearchablePDFURL: string;
}

export interface ExtractedData {
  patientInfo: {
    name: string;
    age: string;
    gender: string;
    reportDate: string;
    labName?: string;
  };
  parameters: Array<{
    name: string;
    value: number | string;
    unit: string;
    normalRange: string;
    status: 'normal' | 'high' | 'low';
    severity: 'normal' | 'mild' | 'moderate' | 'critical' | 'monitor';
  }>;
}
