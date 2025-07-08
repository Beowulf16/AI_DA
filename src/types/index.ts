export interface CSVData {
  headers: string[];
  rows: (string | number)[][];
  filename: string;
}

export interface QualityReport {
  totalRows: number;
  totalColumns: number;
  overallScore: number;
  
  // 7 Quality Dimensions
  missingValuesScore: number;
  duplicatesScore: number;
  invalidFormatScore: number;
  valueRangeScore: number;
  inconsistentValuesScore: number;
  unusualPatternsScore: number;
  sensitiveDataScore: number;
  
  // Detailed metrics
  missingValues: {
    [column: string]: number;
  };
  duplicateRows: number;
  dataTypes: {
    [column: string]: string;
  };
  outliers: {
    [column: string]: number[];
  };
  formatIssues: {
    [column: string]: number;
  };
  rangeIssues: {
    [column: string]: number;
  };
  inconsistencyIssues: {
    [column: string]: number;
  };
  unusualPatterns: {
    [column: string]: number;
  };
  sensitiveDataDetected: {
    [column: string]: string[];
  };
  
  recommendations: string[];
}

export interface CleaningOperation {
  type: 'remove_duplicates' | 'fill_missing' | 'remove_outliers' | 'standardize' | 'fix_format' | 'handle_sensitive';
  column?: string;
  value?: any;
  description: string;
}