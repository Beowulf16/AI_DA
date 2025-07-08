import React, { useState, useEffect } from 'react';
import { Sparkles, AlertCircle, CheckCircle, TrendingUp, Settings, Users, Brain, Lightbulb, Target, Zap, BarChart3, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { QualityReport } from '../types';

interface AIInsightsProps {
  report: QualityReport;
}

interface InsightSection {
  title: string;
  content: string;
  icon: React.ComponentType<any>;
  priority: 'high' | 'medium' | 'low';
}

const AIInsights: React.FC<AIInsightsProps> = ({ report }) => {
  const [insights, setInsights] = useState<string | null>(null);
  const [structuredInsights, setStructuredInsights] = useState<InsightSection[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('anthropic/claude-3-haiku');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['summary']));

  const availableModels = [
    { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku', provider: 'Anthropic', speed: 'Fast', cost: 'Low' },
    { id: 'anthropic/claude-3-sonnet', name: 'Claude 3 Sonnet', provider: 'Anthropic', speed: 'Medium', cost: 'Medium' },
    { id: 'anthropic/claude-3-opus', name: 'Claude 3 Opus', provider: 'Anthropic', speed: 'Slow', cost: 'High' },
    { id: 'openai/gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'OpenAI', speed: 'Fast', cost: 'Low' },
    { id: 'openai/gpt-4', name: 'GPT-4', provider: 'OpenAI', speed: 'Medium', cost: 'Medium' },
    { id: 'openai/gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'OpenAI', speed: 'Fast', cost: 'Medium' },
    { id: 'meta-llama/llama-3-8b-instruct', name: 'Llama 3 8B', provider: 'Meta', speed: 'Fast', cost: 'Low' },
    { id: 'meta-llama/llama-3-70b-instruct', name: 'Llama 3 70B', provider: 'Meta', speed: 'Medium', cost: 'Medium' },
    { id: 'google/gemini-pro', name: 'Gemini Pro', provider: 'Google', speed: 'Medium', cost: 'Medium' },
    { id: 'mistralai/mixtral-8x7b-instruct', name: 'Mixtral 8x7B', provider: 'Mistral', speed: 'Fast', cost: 'Low' }
  ];

  useEffect(() => {
    const savedApiKey = localStorage.getItem('openrouter_api_key');
    const savedModel = localStorage.getItem('openrouter_model');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
    if (savedModel) {
      setSelectedModel(savedModel);
    }
    generateBasicInsights();
  }, [report]);

  const generateBasicInsights = () => {
    const insights: InsightSection[] = [];

    // Data Quality Summary
    insights.push({
      title: 'Data Quality Summary',
      content: `Your dataset has an overall quality score of ${report.overallScore}%. ${
        report.overallScore >= 90 ? 'Excellent! Your data is in great condition.' :
        report.overallScore >= 80 ? 'Good quality with minor issues to address.' :
        report.overallScore >= 70 ? 'Moderate quality requiring some attention.' :
        report.overallScore >= 60 ? 'Below average quality needing significant improvement.' :
        'Poor quality requiring immediate attention.'
      }`,
      icon: BarChart3,
      priority: report.overallScore >= 80 ? 'low' : report.overallScore >= 60 ? 'medium' : 'high'
    });

    // Completeness Analysis
    if (report.completeness < 95) {
      const missingTotal = Object.values(report.missingValues).reduce((sum, count) => sum + count, 0);
      insights.push({
        title: 'Missing Data Analysis',
        content: `${missingTotal} missing values detected across your dataset (${100 - report.completeness}% incomplete). ${
          report.completeness < 80 ? 'This significantly impacts data reliability and analysis accuracy.' :
          'Consider implementing data validation to prevent missing values.'
        }`,
        icon: AlertCircle,
        priority: report.completeness < 80 ? 'high' : 'medium'
      });
    }

    // Duplicate Analysis
    if (report.duplicateRows > 0) {
      insights.push({
        title: 'Duplicate Data Impact',
        content: `${report.duplicateRows} duplicate rows found (${Math.round((report.duplicateRows / report.totalRows) * 100)}% of total). ${
          report.duplicateRows > report.totalRows * 0.1 ? 'High duplication rate may indicate data collection issues.' :
          'Moderate duplication that should be addressed for accuracy.'
        }`,
        icon: Target,
        priority: report.duplicateRows > report.totalRows * 0.1 ? 'high' : 'medium'
      });
    }

    // Outlier Analysis
    const outlierColumns = Object.entries(report.outliers).filter(([_, outliers]) => outliers.length > 0);
    if (outlierColumns.length > 0) {
      const totalOutliers = outlierColumns.reduce((sum, [_, outliers]) => sum + outliers.length, 0);
      insights.push({
        title: 'Outlier Detection',
        content: `${totalOutliers} outliers detected across ${outlierColumns.length} numeric columns. ${
          totalOutliers > 20 ? 'High number of outliers may indicate data quality issues or natural variation.' :
          'Moderate outliers detected - review for data entry errors.'
        }`,
        icon: TrendingUp,
        priority: totalOutliers > 20 ? 'medium' : 'low'
      });
    }

    // Data Type Consistency
    if (report.consistency < 100) {
      insights.push({
        title: 'Data Type Consistency',
        content: `${report.consistency}% consistency in data types. ${
          report.consistency < 90 ? 'Mixed data types in columns may cause analysis issues.' :
          'Minor inconsistencies in data formatting detected.'
        }`,
        icon: Zap,
        priority: report.consistency < 90 ? 'medium' : 'low'
      });
    }

    // Recommendations
    const recommendations = [];
    if (report.completeness < 90) recommendations.push('Implement data validation rules');
    if (report.duplicateRows > 0) recommendations.push('Remove duplicate entries');
    if (outlierColumns.length > 0) recommendations.push('Review outlier values');
    if (report.consistency < 95) recommendations.push('Standardize data formats');

    if (recommendations.length > 0) {
      insights.push({
        title: 'Priority Recommendations',
        content: `Key actions to improve your data quality: ${recommendations.join(', ')}. ${
          report.overallScore < 70 ? 'Focus on high-priority issues first for maximum impact.' :
          'These improvements will enhance data reliability.'
        }`,
        icon: Lightbulb,
        priority: 'medium'
      });
    }

    setStructuredInsights(insights);
  };

  const generateAdvancedInsights = async () => {
    if (!apiKey) {
      setShowApiKeyInput(true);
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const prompt = `
        As a senior data quality expert, analyze this comprehensive data quality report and provide strategic insights:
        
        DATASET OVERVIEW:
        - Total Rows: ${report.totalRows.toLocaleString()}
        - Total Columns: ${report.totalColumns}
        - Overall Quality Score: ${report.overallScore}%
        
        7-DIMENSION QUALITY ANALYSIS:
        1️⃣ Missing Values: ${report.missingValuesScore}% (${Object.values(report.missingValues).reduce((a, b) => a + b, 0)} missing values)
        2️⃣ Duplicates: ${report.duplicatesScore}% (${report.duplicateRows} duplicate rows)
        3️⃣ Invalid Format: ${report.invalidFormatScore}% (${Object.values(report.formatIssues || {}).reduce((a, b) => a + b, 0)} format issues)
        4️⃣ Value Range: ${report.valueRangeScore}% (${Object.values(report.rangeIssues || {}).reduce((a, b) => a + b, 0)} range violations)
        5️⃣ Inconsistent Values: ${report.inconsistentValuesScore}% (${Object.values(report.inconsistencyIssues || {}).reduce((a, b) => a + b, 0)} inconsistencies)
        6️⃣ Unusual Patterns: ${report.unusualPatternsScore}% (${Object.values(report.unusualPatterns || {}).reduce((a, b) => a + b, 0)} suspicious patterns)
        7️⃣ Sensitive Data (PII): ${report.sensitiveDataScore}% (${Object.keys(report.sensitiveDataDetected || {}).length} columns with PII)
        
        DETAILED ISSUES:
        - Missing Values: ${Object.entries(report.missingValues).filter(([_, count]) => count > 0).map(([col, count]) => `${col}: ${count}`).join(', ') || 'None'}
        - Data Types: ${Object.entries(report.dataTypes).map(([col, type]) => `${col}: ${type}`).join(', ')}
        - Format Issues: ${Object.entries(report.formatIssues || {}).filter(([_, count]) => count > 0).map(([col, count]) => `${col}: ${count}`).join(', ') || 'None'}
        - Range Violations: ${Object.entries(report.rangeIssues || {}).filter(([_, count]) => count > 0).map(([col, count]) => `${col}: ${count}`).join(', ') || 'None'}
        - Sensitive Data: ${Object.entries(report.sensitiveDataDetected || {}).map(([col, types]) => `${col}: ${types.join(', ')}`).join('; ') || 'None'}
        
        COMPLIANCE & PRIVACY CONTEXT:
        - PII Detection: Email addresses, phone numbers, SSNs, credit cards
        - Data Privacy Risk: ${Object.keys(report.sensitiveDataDetected || {}).length > 0 ? 'HIGH - Immediate attention required' : 'LOW - No obvious PII detected'}
        - Regulatory Compliance: Consider GDPR, CCPA, HIPAA implications
        
        Please provide a comprehensive strategic analysis with:
        
        1. EXECUTIVE SUMMARY (2-3 sentences)
        - Overall assessment focusing on business impact and compliance risks
        
        2. CRITICAL ISSUES & COMPLIANCE ANALYSIS
        - Root cause analysis of major quality problems
        - Privacy and compliance risk assessment (PII, regulatory requirements)
        - Business impact and operational risk evaluation
        
        3. STRATEGIC RECOMMENDATIONS
        - Prioritized action plan (High/Medium/Low priority)
        - Compliance and privacy protection measures
        - Implementation timeline suggestions
        - Resource requirements
        
        4. DATA GOVERNANCE INSIGHTS
        - Process improvements needed
        - Privacy protection and data handling protocols
        - Preventive measures
        - Quality monitoring strategies
        
        5. BUSINESS VALUE OPPORTUNITIES
        - How improving data quality will benefit the organization
        - Risk mitigation value (compliance, reputation, operational)
        - Potential ROI of data quality improvements
        - Use case optimization suggestions
        
        6. TECHNICAL IMPLEMENTATION GUIDE
        - Specific tools and techniques recommended
        - Privacy-preserving data processing methods
        - Data pipeline improvements
        - Automation opportunities
        
        Format your response with clear sections and actionable insights. Be specific, practical, and emphasize compliance and privacy considerations given the 7-dimension analysis framework.
      `;

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Kipi.ai Data Quality Analyzer'
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            {
              role: 'system',
              content: 'You are a world-class data quality expert with 20+ years of experience in enterprise data management, analytics, and business intelligence. Provide strategic, actionable insights that drive business value. Be specific, practical, and focus on measurable outcomes.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 2500,
          temperature: 0.7,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Failed to generate insights. Please check your API key and try again.');
      }

      const data = await response.json();
      const generatedInsights = data.choices[0].message.content;
      
      setInsights(generatedInsights);
      localStorage.setItem('openrouter_api_key', apiKey);
      localStorage.setItem('openrouter_model', selectedModel);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while generating insights');
    } finally {
      setIsGenerating(false);
    }
  };

  const saveApiKey = () => {
    if (apiKey) {
      localStorage.setItem('openrouter_api_key', apiKey);
      localStorage.setItem('openrouter_model', selectedModel);
      setShowApiKeyInput(false);
      generateAdvancedInsights();
    }
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'low': return 'border-green-200 bg-green-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getPriorityTextColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-800';
      case 'medium': return 'text-yellow-800';
      case 'low': return 'text-green-800';
      default: return 'text-gray-800';
    }
  };

  const selectedModelInfo = availableModels.find(m => m.id === selectedModel);

  return (
    <div className="p-8">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="w-6 h-6 text-kipi-secondary" />
          <h2 className="text-2xl font-bold text-gray-900">AI-Powered Data Insights</h2>
        </div>
        
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Intelligent Analysis</h3>
              <p className="text-gray-600">
                Get expert-level insights about your data quality using our comprehensive 7-dimension framework and advanced AI analysis. 
                Our system provides automated insights and optional AI-powered strategic analysis with compliance focus.
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-kipi-secondary">{structuredInsights.length}</div>
              <div className="text-sm text-gray-600">Insights Generated</div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={generateAdvancedInsights}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 px-6 py-3 bg-kipi-secondary text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Generating Advanced Insights...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate AI Strategic Analysis
                </>
              )}
            </button>
            
            <button
              onClick={() => setShowApiKeyInput(!showApiKeyInput)}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
            >
              <Settings className="w-4 h-4" />
              AI Configuration
            </button>

            {selectedModelInfo && (
              <div className="text-sm text-gray-600">
                Using: <span className="font-medium">{selectedModelInfo.name}</span>
                <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded">
                  {selectedModelInfo.speed} • {selectedModelInfo.cost} cost
                </span>
              </div>
            )}
          </div>
        </div>

        {/* API Configuration */}
        {showApiKeyInput && (
          <div className="bg-white border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="font-medium text-blue-900 mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              AI Model Configuration
            </h3>
            <p className="text-sm text-blue-700 mb-4">
              Configure your OpenRouter API key to access advanced AI models for deep data quality analysis. 
              OpenRouter provides access to multiple leading AI models optimized for strategic business analysis and compliance assessment.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-blue-800 mb-2">API Key</label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-or-..."
                    className="flex-1 px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-kipi-primary"
                  />
                  <button
                    onClick={saveApiKey}
                    disabled={!apiKey}
                    className="px-4 py-2 bg-kipi-primary text-white rounded-md hover:bg-green-600 disabled:opacity-50"
                  >
                    Save & Generate
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-blue-800 mb-2">AI Model</label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-kipi-primary"
                >
                  {availableModels.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name} ({model.provider}) - {model.speed} • {model.cost} cost
                    </option>
                  ))}
                </select>
                <p className="text-xs text-blue-600 mt-1">
                  Choose based on your needs: Fast models for quick insights, slower models for deeper analysis
                </p>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-600 mb-2">
                <strong>Get your API key:</strong>{' '}
                <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="underline">
                  OpenRouter Dashboard
                </a>
              </p>
              <p className="text-xs text-blue-600">
                OpenRouter offers competitive pricing and access to multiple AI providers in one unified API.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}
      </div>

      {/* Automated Insights */}
      <div className="space-y-6 mb-8">
        <div className="bg-white border rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('summary')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Automated Analysis Summary
              </h3>
            </div>
            {expandedSections.has('summary') ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </button>
          
          {expandedSections.has('summary') && (
            <div className="px-6 pb-6 border-t bg-gray-50">
              <div className="pt-6 space-y-4">
                {structuredInsights.map((insight, index) => {
                  const Icon = insight.icon;
                  return (
                    <div key={index} className={`border rounded-lg p-4 ${getPriorityColor(insight.priority)}`}>
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          insight.priority === 'high' ? 'bg-red-100' :
                          insight.priority === 'medium' ? 'bg-yellow-100' :
                          'bg-green-100'
                        }`}>
                          <Icon className={`w-5 h-5 ${
                            insight.priority === 'high' ? 'text-red-600' :
                            insight.priority === 'medium' ? 'text-yellow-600' :
                            'text-green-600'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className={`font-semibold ${getPriorityTextColor(insight.priority)}`}>
                              {insight.title}
                            </h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              insight.priority === 'high' ? 'bg-red-100 text-red-700' :
                              insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {insight.priority} priority
                            </span>
                          </div>
                          <p className={`text-sm ${getPriorityTextColor(insight.priority)}`}>
                            {insight.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI-Generated Advanced Insights */}
      {insights && (
        <div className="bg-white border rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('ai-insights')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-kipi-secondary" />
              <h3 className="text-lg font-semibold text-gray-900">
                AI-Generated Strategic Analysis
              </h3>
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({selectedModelInfo?.name})
              </span>
            </div>
            {expandedSections.has('ai-insights') ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </button>
          
          {expandedSections.has('ai-insights') && (
            <div className="px-6 pb-6 border-t bg-gray-50">
              <div className="pt-6">
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap text-gray-700 leading-relaxed bg-white p-6 rounded-lg border">
                    {insights}
                  </div>
                </div>
                
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">AI Analysis Details</span>
                  </div>
                  <div className="text-xs text-blue-700 space-y-1">
                    <p>Model: {selectedModelInfo?.name} ({selectedModelInfo?.provider})</p>
                    <p>Analysis Type: Strategic data quality assessment with business impact focus</p>
                    <p>Generated: {new Date().toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Next Steps</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border">
            <Target className="w-6 h-6 text-kipi-primary mb-2" />
            <h4 className="font-medium text-gray-900 mb-1">Address Critical Issues</h4>
            <p className="text-sm text-gray-600">
              Focus on high-priority issues identified in the analysis for maximum impact.
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <Zap className="w-6 h-6 text-kipi-secondary mb-2" />
            <h4 className="font-medium text-gray-900 mb-1">Apply Data Cleaning</h4>
            <p className="text-sm text-gray-600">
              Use the Data Cleaning tab to automatically fix identified issues.
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <TrendingUp className="w-6 h-6 text-green-600 mb-2" />
            <h4 className="font-medium text-gray-900 mb-1">Monitor Progress</h4>
            <p className="text-sm text-gray-600">
              Re-run analysis after cleaning to track quality improvements.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIInsights;