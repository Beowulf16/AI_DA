import React, { useState } from 'react';
import { Download, FileText, CheckCircle, BarChart3 } from 'lucide-react';
import { CSVData } from '../types';

interface ExportDataProps {
  data: CSVData;
  originalData: CSVData | null;
}

const ExportData: React.FC<ExportDataProps> = ({ data, originalData }) => {
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');
  const [isExporting, setIsExporting] = useState(false);

  const convertToCSV = (csvData: CSVData): string => {
    const headers = csvData.headers.join(',');
    const rows = csvData.rows.map(row => 
      row.map(cell => {
        const stringCell = String(cell);
        // Escape quotes and wrap in quotes if contains comma
        return stringCell.includes(',') || stringCell.includes('"') 
          ? `"${stringCell.replace(/"/g, '""')}"`
          : stringCell;
      }).join(',')
    );
    return [headers, ...rows].join('\n');
  };

  const convertToJSON = (csvData: CSVData): string => {
    const jsonData = csvData.rows.map(row => {
      const obj: any = {};
      csvData.headers.forEach((header, index) => {
        obj[header] = row[index];
      });
      return obj;
    });
    return JSON.stringify(jsonData, null, 2);
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    // Simulate export delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const content = exportFormat === 'csv' ? convertToCSV(data) : convertToJSON(data);
    const mimeType = exportFormat === 'csv' ? 'text/csv' : 'application/json';
    const extension = exportFormat === 'csv' ? '.csv' : '.json';
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.filename.replace('.csv', '')}${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setIsExporting(false);
  };

  const getImprovementStats = () => {
    if (!originalData) return null;
    
    const originalRows = originalData.rows.length;
    const cleanedRows = data.rows.length;
    const rowsRemoved = originalRows - cleanedRows;
    const improvementPercentage = Math.round((rowsRemoved / originalRows) * 100);
    
    return {
      originalRows,
      cleanedRows,
      rowsRemoved,
      improvementPercentage
    };
  };

  const stats = getImprovementStats();

  return (
    <div className="p-8">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Download className="w-6 h-6 text-green-600" />
          <h2 className="text-2xl font-bold text-gray-900">Export Cleaned Data</h2>
        </div>
        
        <p className="text-gray-600">
          Your data has been cleaned and is ready for export. Choose your preferred format and download.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Export Options */}
        <div className="space-y-6">
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Options</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Export Format
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setExportFormat('csv')}
                    className={`p-3 border rounded-lg text-center transition-all ${
                      exportFormat === 'csv'
                        ? 'border-green-500 bg-green-50 text-green-900'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <FileText className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-sm font-medium">CSV</span>
                  </button>
                  <button
                    onClick={() => setExportFormat('json')}
                    className={`p-3 border rounded-lg text-center transition-all ${
                      exportFormat === 'json'
                        ? 'border-green-500 bg-green-50 text-green-900'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <FileText className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-sm font-medium">JSON</span>
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  File Information
                </label>
                <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Filename:</span>
                    <span className="font-medium">{data.filename.replace('.csv', '')}.{exportFormat}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Rows:</span>
                    <span className="font-medium">{data.rows.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Columns:</span>
                    <span className="font-medium">{data.headers.length}</span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {isExporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Export Data
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-6">
          {/* Improvement Summary */}
          {stats && (
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-kipi-secondary" />
                Cleaning Summary
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-1">Original Rows</h4>
                    <p className="text-2xl font-bold text-blue-700">{stats.originalRows}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-1">Cleaned Rows</h4>
                    <p className="text-2xl font-bold text-green-700">{stats.cleanedRows}</p>
                  </div>
                </div>
                
                {stats.rowsRemoved > 0 && (
                  <div className="bg-amber-50 p-4 rounded-lg">
                    <h4 className="font-medium text-amber-900 mb-1">Rows Removed</h4>
                    <p className="text-2xl font-bold text-amber-700">{stats.rowsRemoved}</p>
                    <p className="text-sm text-amber-600">({stats.improvementPercentage}% reduction)</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Data Preview */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Final Data Preview</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    {data.headers.slice(0, 4).map((header, index) => (
                      <th key={index} className="px-3 py-2 text-left font-medium text-gray-900">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.rows.slice(0, 5).map((row, rowIndex) => (
                    <tr key={rowIndex} className="border-t">
                      {row.slice(0, 4).map((cell, cellIndex) => (
                        <td key={cellIndex} className="px-3 py-2 text-gray-700">
                          {cell === '' || cell === null || cell === undefined ? (
                            <span className="text-gray-400 italic">empty</span>
                          ) : (
                            String(cell)
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Success Message */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-900">Data cleaning completed successfully!</span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              Your data has been processed and is ready for export. You can now download the cleaned dataset.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportData;