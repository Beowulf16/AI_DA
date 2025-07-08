import React, { useCallback, useState } from 'react';
import { Upload, FileText, AlertCircle, Download } from 'lucide-react';
import { CSVData } from '../types';

interface FileUploadProps {
  onDataUpload: (data: CSVData) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onDataUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseCSV = useCallback((csvText: string, filename: string): CSVData => {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    const rows = lines.slice(1).map(line => {
      const values = line.split(',').map(value => {
        const trimmed = value.trim().replace(/"/g, '');
        // Try to parse as number
        const num = Number(trimmed);
        return !isNaN(num) && trimmed !== '' ? num : trimmed;
      });
      return values;
    });

    return {
      headers,
      rows,
      filename
    };
  }, []);

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const text = await file.text();
      const data = parseCSV(text, file.name);
      onDataUpload(data);
    } catch (err) {
      setError('Error parsing CSV file. Please check the format.');
    } finally {
      setIsProcessing(false);
    }
  }, [parseCSV, onDataUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  return (
    <div className="p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Your CSV Data</h2>
        <p className="text-gray-600">
          Drag and drop your CSV file or click to browse. We'll analyze its quality and provide insights.
        </p>
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-lg p-12 text-center transition-all ${
          isDragging
            ? 'border-kipi-primary bg-green-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <div className="flex flex-col items-center gap-4">
          <div className={`p-4 rounded-full ${isDragging ? 'bg-green-100' : 'bg-gray-100'}`}>
            <Upload className={`w-8 h-8 ${isDragging ? 'text-kipi-primary' : 'text-gray-600'}`} />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {isProcessing ? 'Processing...' : 'Upload CSV File'}
            </h3>
            <p className="text-gray-500 mb-4">
              Drag and drop your file here, or click to browse
            </p>
            
            <input
              type="file"
              accept=".csv"
              onChange={handleFileInput}
              disabled={isProcessing}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-md font-medium transition-all cursor-pointer ${
                isProcessing
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-kipi-primary text-white hover:bg-green-600'
              }`}
            >
              <FileText className="w-4 h-4" />
              Choose File
            </label>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <Upload className="w-8 h-8 text-kipi-primary mx-auto mb-2" />
          <h4 className="font-medium text-gray-900 mb-1">Step 1: Upload</h4>
          <p className="text-sm text-gray-600">Upload your CSV file to get started</p>
        </div>
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <FileText className="w-8 h-8 text-kipi-secondary mx-auto mb-2" />
          <h4 className="font-medium text-gray-900 mb-1">Step 2: Analyze</h4>
          <p className="text-sm text-gray-600">Get comprehensive quality insights</p>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <Download className="w-8 h-8 text-kipi-primary mx-auto mb-2" />
          <h4 className="font-medium text-gray-900 mb-1">Step 3: Export</h4>
          <p className="text-sm text-gray-600">Download your cleaned data</p>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;