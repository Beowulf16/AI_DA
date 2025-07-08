import React, { useState } from 'react';
import { Upload, Database, CheckCircle, AlertTriangle, FileText, Download, Sparkles, BookOpen } from 'lucide-react';
import FileUpload from './components/FileUpload';
import DataPreview from './components/DataPreview';
import QualityAnalysis from './components/QualityAnalysis';
import AIInsights from './components/AIInsights';
import DataCleaning from './components/DataCleaning';
import ExportData from './components/ExportData';
import Documentation from './components/Documentation';
import { CSVData, QualityReport } from './types';

function App() {
  const [csvData, setCsvData] = useState<CSVData | null>(null);
  const [qualityReport, setQualityReport] = useState<QualityReport | null>(null);
  const [cleanedData, setCleanedData] = useState<CSVData | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'preview' | 'analysis' | 'insights' | 'cleaning' | 'export' | 'docs'>('upload');

  const tabs = [
    { id: 'upload', label: 'Upload Data', icon: Upload },
    { id: 'preview', label: 'Preview', icon: FileText, disabled: !csvData },
    { id: 'analysis', label: 'Quality Analysis', icon: Database, disabled: !csvData },
    { id: 'insights', label: 'AI Insights', icon: Sparkles, disabled: !qualityReport },
    { id: 'cleaning', label: 'Data Cleaning', icon: CheckCircle, disabled: !csvData },
    { id: 'export', label: 'Export', icon: Download, disabled: !cleanedData },
    { id: 'docs', label: 'Documentation', icon: BookOpen }
  ];

  const handleDataUpload = (data: CSVData) => {
    setCsvData(data);
    setActiveTab('preview');
  };

  const handleQualityReport = (report: QualityReport) => {
    setQualityReport(report);
  };

  const handleDataCleaning = (data: CSVData) => {
    setCleanedData(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img src="/Logo.png" alt="Kipi.ai" className="h-16" />
            <h1 className="text-4xl font-bold text-gray-900">Data Quality Analyzer</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Powered by Kipi.ai - Upload your CSV data and get comprehensive quality analysis with AI-powered insights and automated cleaning suggestions.
          </p>
        </header>

        <div className="max-w-6xl mx-auto">
          {/* Navigation Tabs */}
          <nav className="mb-8">
            <div className="flex flex-wrap gap-2 p-2 bg-white rounded-lg shadow-sm border overflow-x-auto">
              {tabs.map(({ id, label, icon: Icon, disabled }) => (
                <button
                  key={id}
                  onClick={() => !disabled && setActiveTab(id as any)}
                  disabled={disabled}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all ${
                    activeTab === id
                      ? 'bg-kipi-primary text-white shadow-md'
                      : disabled
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>
          </nav>

          {/* Content Area */}
          <div className="bg-white rounded-lg shadow-lg border">
            {activeTab === 'upload' && (
              <FileUpload onDataUpload={handleDataUpload} />
            )}
            {activeTab === 'preview' && csvData && (
              <DataPreview data={csvData} />
            )}
            {activeTab === 'analysis' && csvData && (
              <QualityAnalysis data={csvData} onReportGenerated={handleQualityReport} />
            )}
            {activeTab === 'insights' && qualityReport && (
              <AIInsights report={qualityReport} />
            )}
            {activeTab === 'cleaning' && csvData && (
              <DataCleaning data={csvData} onDataCleaned={handleDataCleaning} />
            )}
            {activeTab === 'export' && cleanedData && (
              <ExportData data={cleanedData} originalData={csvData} />
            )}
            {activeTab === 'docs' && (
              <Documentation />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;