import React, { useEffect, useState } from 'react';
import { BarChart3, AlertTriangle, CheckCircle, Info, TrendingUp, Trash2, Target, Zap, Eye, ChevronDown, ChevronUp, Filter, Search, Shield, Clock, FileX, Hash } from 'lucide-react';
import { CSVData, QualityReport } from '../types';

interface QualityAnalysisProps {
  data: CSVData;
  onReportGenerated: (report: QualityReport) => void;
}

interface DetailedIssue {
  type: 'missing' | 'duplicate' | 'invalid_format' | 'value_range' | 'inconsistent' | 'unusual_pattern' | 'sensitive_data';
  column: string;
  rowIndex: number;
  value: any;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  dimension: string;
  recommendation: string;
}

const QualityAnalysis: React.FC<QualityAnalysisProps> = ({ data, onReportGenerated }) => {
  const [report, setReport] = useState<QualityReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview']));
  const [detailedIssues, setDetailedIssues] = useState<DetailedIssue[]>([]);
  const [issueFilter, setIssueFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    analyzeData();
  }, [data]);

  const analyzeData = async () => {
    setIsAnalyzing(true);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const issues: DetailedIssue[] = [];
    const missingValues: { [column: string]: number } = {};
    const dataTypes: { [column: string]: string } = {};
    const outliers: { [column: string]: number[] } = {};
    const formatIssues: { [column: string]: number } = {};
    const rangeIssues: { [column: string]: number } = {};
    const inconsistencyIssues: { [column: string]: number } = {};
    const unusualPatterns: { [column: string]: number } = {};
    const sensitiveDataDetected: { [column: string]: string[] } = {};

    // 1️⃣ MISSING VALUES ANALYSIS
    data.headers.forEach((header, colIndex) => {
      const columnData = data.rows.map(row => row[colIndex]);
      let missingCount = 0;
      
      columnData.forEach((val, rowIndex) => {
        if (val === '' || val === null || val === undefined || val === 'null' || val === 'NULL' || val === 'N/A' || val === 'n/a') {
          missingCount++;
          issues.push({
            type: 'missing',
            column: header,
            rowIndex,
            value: val,
            description: `Missing value in "${header}" - empty or null field`,
            severity: 'medium',
            dimension: 'Missing Values',
            recommendation: 'Fill with appropriate default value or remove row if critical'
          });
        }
      });
      missingValues[header] = missingCount;
    });

    // 2️⃣ DUPLICATES ANALYSIS
    const duplicateRowIndices: number[] = [];
    const seenRows = new Map();
    data.rows.forEach((row, index) => {
      const key = JSON.stringify(row);
      if (seenRows.has(key)) {
        duplicateRowIndices.push(index);
        issues.push({
          type: 'duplicate',
          column: 'All columns',
          rowIndex: index,
          value: row,
          description: `Duplicate row #${index + 1} (identical to row #${seenRows.get(key) + 1})`,
          severity: 'high',
          dimension: 'Duplicates',
          recommendation: 'Remove duplicate row to maintain data integrity'
        });
      } else {
        seenRows.set(key, index);
      }
    });

    // 3️⃣ INVALID FORMAT ANALYSIS
    data.headers.forEach((header, colIndex) => {
      const columnData = data.rows.map(row => row[colIndex]);
      let formatIssueCount = 0;
      
      // Detect column type first
      const numericValues = columnData.filter(val => typeof val === 'number' || (!isNaN(Number(val)) && val !== ''));
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phonePattern = /^[\+]?[1-9][\d]{0,15}$/;
      const datePattern = /^\d{4}-\d{2}-\d{2}$|^\d{2}\/\d{2}\/\d{4}$|^\d{2}-\d{2}-\d{4}$/;
      
      let columnType = 'text';
      if (numericValues.length > columnData.length * 0.7) {
        columnType = 'numeric';
      } else if (header.toLowerCase().includes('email')) {
        columnType = 'email';
      } else if (header.toLowerCase().includes('phone') || header.toLowerCase().includes('mobile')) {
        columnType = 'phone';
      } else if (header.toLowerCase().includes('date') || header.toLowerCase().includes('dob')) {
        columnType = 'date';
      }
      
      dataTypes[header] = columnType;
      
      columnData.forEach((val, rowIndex) => {
        if (val !== '' && val !== null && val !== undefined) {
          let isInvalid = false;
          let errorMsg = '';
          
          switch (columnType) {
            case 'email':
              if (!emailPattern.test(String(val))) {
                isInvalid = true;
                errorMsg = `Invalid email format: "${val}" - missing @ or domain`;
              }
              break;
            case 'phone':
              const cleanPhone = String(val).replace(/[\s\-\(\)]/g, '');
              if (!phonePattern.test(cleanPhone) || cleanPhone.length < 10 || cleanPhone.length > 15) {
                isInvalid = true;
                errorMsg = `Invalid phone format: "${val}" - should be 10-15 digits`;
              }
              break;
            case 'date':
              if (!datePattern.test(String(val)) && isNaN(Date.parse(String(val)))) {
                isInvalid = true;
                errorMsg = `Invalid date format: "${val}" - use YYYY-MM-DD or MM/DD/YYYY`;
              }
              break;
            case 'numeric':
              if (isNaN(Number(val))) {
                isInvalid = true;
                errorMsg = `Non-numeric value in numeric column: "${val}"`;
              }
              break;
          }
          
          if (isInvalid) {
            formatIssueCount++;
            issues.push({
              type: 'invalid_format',
              column: header,
              rowIndex,
              value: val,
              description: errorMsg,
              severity: 'high',
              dimension: 'Invalid Format',
              recommendation: 'Correct format or standardize data entry rules'
            });
          }
        }
      });
      formatIssues[header] = formatIssueCount;
    });

    // 4️⃣ VALUE RANGE ANALYSIS
    data.headers.forEach((header, colIndex) => {
      const columnData = data.rows.map(row => row[colIndex]);
      let rangeIssueCount = 0;
      
      columnData.forEach((val, rowIndex) => {
        if (val !== '' && val !== null && val !== undefined) {
          let isOutOfRange = false;
          let errorMsg = '';
          
          // Age validation
          if (header.toLowerCase().includes('age')) {
            const age = Number(val);
            if (!isNaN(age) && (age < 0 || age > 150)) {
              isOutOfRange = true;
              errorMsg = `Unrealistic age: ${age} - should be between 0-150`;
            }
          }
          
          // Salary validation
          if (header.toLowerCase().includes('salary') || header.toLowerCase().includes('income')) {
            const salary = Number(val);
            if (!isNaN(salary) && salary < 0) {
              isOutOfRange = true;
              errorMsg = `Negative salary: ${salary} - should be positive`;
            }
          }
          
          // Date of birth validation
          if (header.toLowerCase().includes('dob') || header.toLowerCase().includes('birth')) {
            const date = new Date(String(val));
            if (!isNaN(date.getTime())) {
              const now = new Date();
              if (date > now) {
                isOutOfRange = true;
                errorMsg = `Future birth date: ${val} - cannot be in the future`;
              }
              if (date.getFullYear() < 1900) {
                isOutOfRange = true;
                errorMsg = `Very old birth date: ${val} - seems unrealistic`;
              }
            }
          }
          
          // Phone number length validation
          if (header.toLowerCase().includes('phone')) {
            const cleanPhone = String(val).replace(/[\s\-\(\)]/g, '');
            if (cleanPhone.length < 10 || cleanPhone.length > 15) {
              isOutOfRange = true;
              errorMsg = `Phone number length issue: "${val}" - should be 10-15 digits`;
            }
          }
          
          if (isOutOfRange) {
            rangeIssueCount++;
            issues.push({
              type: 'value_range',
              column: header,
              rowIndex,
              value: val,
              description: errorMsg,
              severity: 'high',
              dimension: 'Value Range',
              recommendation: 'Verify data accuracy and correct unrealistic values'
            });
          }
        }
      });
      rangeIssues[header] = rangeIssueCount;
    });

    // 5️⃣ INCONSISTENT VALUES ANALYSIS
    data.headers.forEach((header, colIndex) => {
      const columnData = data.rows.map(row => row[colIndex]);
      let inconsistencyCount = 0;
      
      // Check for text formatting inconsistencies
      if (dataTypes[header] === 'text') {
        columnData.forEach((val, rowIndex) => {
          if (typeof val === 'string' && val !== '') {
            let hasIssue = false;
            let errorMsg = '';
            
            // Mixed case inconsistency
            if (val !== val.toLowerCase() && val !== val.toUpperCase() && val !== val.charAt(0).toUpperCase() + val.slice(1).toLowerCase()) {
              hasIssue = true;
              errorMsg = `Inconsistent text case: "${val}" - mixed capitalization`;
            }
            
            // Extra whitespace
            if (val !== val.trim() || val.includes('  ')) {
              hasIssue = true;
              errorMsg = `Extra whitespace in: "${val}" - needs trimming`;
            }
            
            if (hasIssue) {
              inconsistencyCount++;
              issues.push({
                type: 'inconsistent',
                column: header,
                rowIndex,
                value: val,
                description: errorMsg,
                severity: 'low',
                dimension: 'Inconsistent Values',
                recommendation: 'Standardize text formatting and remove extra spaces'
              });
            }
          }
        });
      }
      
      // Check for logical inconsistencies between related columns
      if (header.toLowerCase().includes('ship') && data.headers.some(h => h.toLowerCase().includes('order'))) {
        const orderDateCol = data.headers.findIndex(h => h.toLowerCase().includes('order') && h.toLowerCase().includes('date'));
        if (orderDateCol !== -1) {
          columnData.forEach((shipDate, rowIndex) => {
            const orderDate = data.rows[rowIndex][orderDateCol];
            if (shipDate && orderDate) {
              const ship = new Date(String(shipDate));
              const order = new Date(String(orderDate));
              if (!isNaN(ship.getTime()) && !isNaN(order.getTime()) && ship < order) {
                inconsistencyCount++;
                issues.push({
                  type: 'inconsistent',
                  column: header,
                  rowIndex,
                  value: shipDate,
                  description: `Ship date (${shipDate}) before order date (${orderDate}) - logically inconsistent`,
                  severity: 'high',
                  dimension: 'Inconsistent Values',
                  recommendation: 'Verify and correct date sequence logic'
                });
              }
            }
          });
        }
      }
      
      inconsistencyIssues[header] = inconsistencyCount;
    });

    // 6️⃣ UNUSUAL PATTERNS ANALYSIS
    data.headers.forEach((header, colIndex) => {
      const columnData = data.rows.map(row => row[colIndex]);
      let unusualCount = 0;
      
      columnData.forEach((val, rowIndex) => {
        if (val !== '' && val !== null && val !== undefined) {
          const strVal = String(val);
          let isUnusual = false;
          let errorMsg = '';
          
          // Repeated characters (like 9999999999)
          if (strVal.length > 3 && /^(.)\1+$/.test(strVal)) {
            isUnusual = true;
            errorMsg = `Suspicious repeated pattern: "${val}" - likely placeholder data`;
          }
          
          // Sequential patterns (like 1234567890)
          if (strVal.length > 4 && /^(0123456789|1234567890|abcdefghij)/.test(strVal.toLowerCase())) {
            isUnusual = true;
            errorMsg = `Sequential pattern detected: "${val}" - likely test data`;
          }
          
          // Common dummy values
          const dummyPatterns = ['test', 'dummy', 'sample', 'example', 'placeholder', 'temp', 'xxx', 'yyy', 'zzz'];
          if (dummyPatterns.some(pattern => strVal.toLowerCase().includes(pattern))) {
            isUnusual = true;
            errorMsg = `Dummy/test value detected: "${val}" - should be replaced with real data`;
          }
          
          // Suspicious email patterns
          if (header.toLowerCase().includes('email') && (
            strVal.includes('test@') || 
            strVal.includes('dummy@') || 
            strVal.includes('example@') ||
            strVal.includes('@test.') ||
            strVal.includes('@dummy.')
          )) {
            isUnusual = true;
            errorMsg = `Test email detected: "${val}" - likely not a real email address`;
          }
          
          if (isUnusual) {
            unusualCount++;
            issues.push({
              type: 'unusual_pattern',
              column: header,
              rowIndex,
              value: val,
              description: errorMsg,
              severity: 'medium',
              dimension: 'Unusual Patterns',
              recommendation: 'Replace with authentic data or verify if legitimate'
            });
          }
        }
      });
      unusualPatterns[header] = unusualCount;
    });

    // 7️⃣ SENSITIVE DATA (PII) ANALYSIS
    data.headers.forEach((header, colIndex) => {
      const columnData = data.rows.map(row => row[colIndex]);
      const sensitiveTypes: string[] = [];
      
      columnData.forEach((val, rowIndex) => {
        if (val !== '' && val !== null && val !== undefined) {
          const strVal = String(val);
          
          // Email detection
          if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(strVal)) {
            if (!sensitiveTypes.includes('Email')) sensitiveTypes.push('Email');
            issues.push({
              type: 'sensitive_data',
              column: header,
              rowIndex,
              value: val,
              description: `Email address detected: "${val}" - contains PII`,
              severity: 'critical',
              dimension: 'Sensitive Data (PII)',
              recommendation: 'Mask, encrypt, or remove email addresses for privacy compliance'
            });
          }
          
          // Phone number detection
          const cleanPhone = strVal.replace(/[\s\-\(\)]/g, '');
          if (/^[\+]?[1-9][\d]{9,14}$/.test(cleanPhone)) {
            if (!sensitiveTypes.includes('Phone')) sensitiveTypes.push('Phone');
            issues.push({
              type: 'sensitive_data',
              column: header,
              rowIndex,
              value: val,
              description: `Phone number detected: "${val}" - contains PII`,
              severity: 'critical',
              dimension: 'Sensitive Data (PII)',
              recommendation: 'Mask or encrypt phone numbers for privacy protection'
            });
          }
          
          // SSN-like patterns (XXX-XX-XXXX)
          if (/^\d{3}-\d{2}-\d{4}$/.test(strVal) || /^\d{9}$/.test(strVal)) {
            if (!sensitiveTypes.includes('SSN')) sensitiveTypes.push('SSN');
            issues.push({
              type: 'sensitive_data',
              column: header,
              rowIndex,
              value: val,
              description: `Potential SSN detected: "${val}" - highly sensitive PII`,
              severity: 'critical',
              dimension: 'Sensitive Data (PII)',
              recommendation: 'Immediately encrypt or remove SSN data - high compliance risk'
            });
          }
          
          // Credit card patterns
          if (/^\d{4}[\s\-]?\d{4}[\s\-]?\d{4}[\s\-]?\d{4}$/.test(strVal)) {
            if (!sensitiveTypes.includes('Credit Card')) sensitiveTypes.push('Credit Card');
            issues.push({
              type: 'sensitive_data',
              column: header,
              rowIndex,
              value: val,
              description: `Potential credit card number: "${val}" - financial PII`,
              severity: 'critical',
              dimension: 'Sensitive Data (PII)',
              recommendation: 'Remove credit card data immediately - PCI compliance violation'
            });
          }
        }
      });
      
      if (sensitiveTypes.length > 0) {
        sensitiveDataDetected[header] = sensitiveTypes;
      }
    });

    // Calculate scores for each dimension (0-100)
    const totalCells = data.rows.length * data.headers.length;
    const totalMissing = Object.values(missingValues).reduce((sum, count) => sum + count, 0);
    const missingValuesScore = Math.round(((totalCells - totalMissing) / totalCells) * 100);
    
    const duplicatesScore = Math.round(((data.rows.length - duplicateRowIndices.length) / data.rows.length) * 100);
    
    const totalFormatIssues = Object.values(formatIssues).reduce((sum, count) => sum + count, 0);
    const invalidFormatScore = Math.max(0, Math.round(100 - (totalFormatIssues / data.rows.length) * 100));
    
    const totalRangeIssues = Object.values(rangeIssues).reduce((sum, count) => sum + count, 0);
    const valueRangeScore = Math.max(0, Math.round(100 - (totalRangeIssues / data.rows.length) * 100));
    
    const totalInconsistencies = Object.values(inconsistencyIssues).reduce((sum, count) => sum + count, 0);
    const inconsistentValuesScore = Math.max(0, Math.round(100 - (totalInconsistencies / data.rows.length) * 100));
    
    const totalUnusualPatterns = Object.values(unusualPatterns).reduce((sum, count) => sum + count, 0);
    const unusualPatternsScore = Math.max(0, Math.round(100 - (totalUnusualPatterns / data.rows.length) * 100));
    
    const totalSensitiveData = issues.filter(i => i.type === 'sensitive_data').length;
    const sensitiveDataScore = totalSensitiveData === 0 ? 100 : Math.max(0, Math.round(100 - (totalSensitiveData / data.rows.length) * 100));
    
    // Calculate overall score (weighted average)
    const overallScore = Math.round((
      missingValuesScore * 0.20 +
      duplicatesScore * 0.15 +
      invalidFormatScore * 0.15 +
      valueRangeScore * 0.15 +
      inconsistentValuesScore * 0.10 +
      unusualPatternsScore * 0.10 +
      sensitiveDataScore * 0.15
    ));

    const qualityReport: QualityReport = {
      totalRows: data.rows.length,
      totalColumns: data.headers.length,
      overallScore,
      missingValuesScore,
      duplicatesScore,
      invalidFormatScore,
      valueRangeScore,
      inconsistentValuesScore,
      unusualPatternsScore,
      sensitiveDataScore,
      missingValues,
      duplicateRows: duplicateRowIndices.length,
      dataTypes,
      outliers,
      formatIssues,
      rangeIssues,
      inconsistencyIssues,
      unusualPatterns,
      sensitiveDataDetected,
      recommendations: generateRecommendations(overallScore, issues)
    };
    
    setReport(qualityReport);
    setDetailedIssues(issues);
    onReportGenerated(qualityReport);
    setIsAnalyzing(false);
  };

  const generateRecommendations = (score: number, issues: DetailedIssue[]): string[] => {
    const recommendations: string[] = [];
    
    if (score < 60) {
      recommendations.push("🚨 CRITICAL: Overall data quality is unacceptable. Immediate comprehensive cleanup required.");
    } else if (score < 80) {
      recommendations.push("⚠️ WARNING: Data quality needs significant improvement before production use.");
    }
    
    const criticalIssues = issues.filter(i => i.severity === 'critical').length;
    if (criticalIssues > 0) {
      recommendations.push(`🔒 PRIVACY ALERT: ${criticalIssues} critical issues found including sensitive data exposure.`);
    }
    
    const sensitiveDataIssues = issues.filter(i => i.type === 'sensitive_data').length;
    if (sensitiveDataIssues > 0) {
      recommendations.push(`🛡️ COMPLIANCE RISK: ${sensitiveDataIssues} PII/sensitive data instances require immediate attention.`);
    }
    
    const highSeverityIssues = issues.filter(i => i.severity === 'high').length;
    if (highSeverityIssues > 0) {
      recommendations.push(`⚡ HIGH PRIORITY: ${highSeverityIssues} high-severity issues affecting data reliability.`);
    }
    
    // Specific dimension recommendations
    const missingIssues = issues.filter(i => i.type === 'missing').length;
    if (missingIssues > data.rows.length * 0.1) {
      recommendations.push("📝 Implement data validation rules to prevent missing values at data entry.");
    }
    
    const duplicateIssues = issues.filter(i => i.type === 'duplicate').length;
    if (duplicateIssues > 0) {
      recommendations.push("🗑️ Establish unique constraints and deduplication processes.");
    }
    
    const formatIssues = issues.filter(i => i.type === 'invalid_format').length;
    if (formatIssues > 0) {
      recommendations.push("📋 Standardize data entry formats and implement input validation.");
    }
    
    const rangeIssues = issues.filter(i => i.type === 'value_range').length;
    if (rangeIssues > 0) {
      recommendations.push("📊 Implement range validation and business rule checks.");
    }
    
    const unusualPatterns = issues.filter(i => i.type === 'unusual_pattern').length;
    if (unusualPatterns > 0) {
      recommendations.push("🔍 Review and replace test/dummy data with authentic values.");
    }
    
    if (recommendations.length === 0) {
      recommendations.push("✅ Excellent data quality! Consider implementing monitoring to maintain standards.");
    }
    
    return recommendations;
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

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-green-500';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return 'bg-green-50 border-green-200';
    if (score >= 80) return 'bg-green-50 border-green-200';
    if (score >= 70) return 'bg-yellow-50 border-yellow-200';
    if (score >= 60) return 'bg-orange-50 border-orange-200';
    return 'bg-red-50 border-red-200';
  };

  const getScoreGrade = (score: number) => {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  };

  const filteredIssues = detailedIssues.filter(issue => {
    const matchesFilter = issueFilter === 'all' || issue.type === issueFilter;
    const matchesSearch = searchTerm === '' || 
      issue.column.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.dimension.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const issueTypeColors = {
    missing: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    duplicate: 'bg-red-100 text-red-800 border-red-200',
    invalid_format: 'bg-orange-100 text-orange-800 border-orange-200',
    value_range: 'bg-purple-100 text-purple-800 border-purple-200',
    inconsistent: 'bg-blue-100 text-blue-800 border-blue-200',
    unusual_pattern: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    sensitive_data: 'bg-red-200 text-red-900 border-red-300'
  };

  const severityColors = {
    low: 'bg-gray-100 text-gray-700',
    medium: 'bg-orange-100 text-orange-700',
    high: 'bg-red-100 text-red-700',
    critical: 'bg-red-200 text-red-900 font-bold'
  };

  if (isAnalyzing) {
    return (
      <div className="p-8 text-center">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-lg font-medium text-gray-900">Performing comprehensive 7-dimension data quality analysis...</span>
        </div>
        <p className="text-gray-600 mb-4">Analyzing {data.rows.length} rows and {data.headers.length} columns across all quality dimensions</p>
        <div className="max-w-md mx-auto bg-gray-200 rounded-full h-2">
          <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
        </div>
        <p className="text-sm text-gray-500 mt-4">
          Checking: Missing Values • Duplicates • Invalid Formats • Value Ranges • Inconsistencies • Unusual Patterns • Sensitive Data
        </p>
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="p-8">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <BarChart3 className="w-6 h-6 text-kipi-secondary" />
          <h2 className="text-2xl font-bold text-gray-900">7-Dimension Data Quality Analysis</h2>
        </div>
        
        {/* Overall Score Card */}
        <div className={`border-2 rounded-xl p-8 mb-6 ${getScoreBg(report.overallScore)}`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Comprehensive Quality Assessment</h3>
              <p className="text-gray-700 mb-4">
                Industry-standard 7-dimension analysis of {report.totalRows.toLocaleString()} rows and {report.totalColumns} columns
              </p>
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600">
                  <strong>Total Issues:</strong> {detailedIssues.length}
                </div>
                <div className="text-sm text-gray-600">
                  <strong>Critical:</strong> {detailedIssues.filter(i => i.severity === 'critical').length}
                </div>
                <div className="text-sm text-gray-600">
                  <strong>High Priority:</strong> {detailedIssues.filter(i => i.severity === 'high').length}
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className={`text-6xl font-bold ${getScoreColor(report.overallScore)} mb-2`}>
                {report.overallScore}%
              </div>
              <div className={`text-2xl font-bold ${getScoreColor(report.overallScore)} mb-1`}>
                Grade {getScoreGrade(report.overallScore)}
              </div>
              <div className="text-sm text-gray-600">Overall Quality Score</div>
            </div>
          </div>
        </div>
        
        {/* 7 Quality Dimensions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {[
            { 
              name: 'Missing Values', 
              score: report.missingValuesScore, 
              icon: FileX, 
              description: 'Blanks, nulls, or empty fields',
              details: `${Object.values(report.missingValues).reduce((a, b) => a + b, 0)} missing values`,
              emoji: '1️⃣'
            },
            { 
              name: 'Duplicates', 
              score: report.duplicatesScore, 
              icon: Trash2, 
              description: 'Duplicate rows or repeated values',
              details: `${report.duplicateRows} duplicate rows`,
              emoji: '2️⃣'
            },
            { 
              name: 'Invalid Format', 
              score: report.invalidFormatScore, 
              icon: AlertTriangle, 
              description: 'Values not following expected format',
              details: `${Object.values(report.formatIssues).reduce((a, b) => a + b, 0)} format issues`,
              emoji: '3️⃣'
            },
            { 
              name: 'Value Range', 
              score: report.valueRangeScore, 
              icon: Target, 
              description: 'Values outside acceptable ranges',
              details: `${Object.values(report.rangeIssues).reduce((a, b) => a + b, 0)} range violations`,
              emoji: '4️⃣'
            },
            { 
              name: 'Inconsistent Values', 
              score: report.inconsistentValuesScore, 
              icon: Zap, 
              description: 'Inconsistent across related fields',
              details: `${Object.values(report.inconsistencyIssues).reduce((a, b) => a + b, 0)} inconsistencies`,
              emoji: '5️⃣'
            },
            { 
              name: 'Unusual Patterns', 
              score: report.unusualPatternsScore, 
              icon: Eye, 
              description: 'Rare, fake, or suspicious values',
              details: `${Object.values(report.unusualPatterns).reduce((a, b) => a + b, 0)} unusual patterns`,
              emoji: '6️⃣'
            },
            { 
              name: 'Sensitive Data', 
              score: report.sensitiveDataScore, 
              icon: Shield, 
              description: 'Personal or risky information (PII)',
              details: `${Object.keys(report.sensitiveDataDetected).length} columns with PII`,
              emoji: '7️⃣'
            }
          ].map((metric) => {
            const Icon = metric.icon;
            return (
              <div key={metric.name} className={`border-2 rounded-lg p-6 ${getScoreBg(metric.score)}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{metric.emoji}</span>
                    <Icon className={`w-6 h-6 ${getScoreColor(metric.score)}`} />
                  </div>
                  <div className={`text-3xl font-bold ${getScoreColor(metric.score)}`}>
                    {metric.score}%
                  </div>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">{metric.name}</h4>
                <p className="text-sm text-gray-600 mb-2">{metric.description}</p>
                <p className="text-xs text-gray-500">{metric.details}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expandable Sections */}
      <div className="space-y-6">
        {/* Detailed Issues Section */}
        <div className="bg-white border rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('issues')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Detailed Issues Analysis ({detailedIssues.length})
              </h3>
            </div>
            {expandedSections.has('issues') ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </button>
          
          {expandedSections.has('issues') && (
            <div className="px-6 pb-6 border-t bg-gray-50">
              <div className="pt-6">
                {/* Issue Filters */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search issues by column, description, or dimension..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kipi-primary"
                    />
                  </div>
                  <select
                    value={issueFilter}
                    onChange={(e) => setIssueFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kipi-primary"
                  >
                    <option value="all">All Issues ({detailedIssues.length})</option>
                    <option value="missing">1️⃣ Missing Values ({detailedIssues.filter(i => i.type === 'missing').length})</option>
                    <option value="duplicate">2️⃣ Duplicates ({detailedIssues.filter(i => i.type === 'duplicate').length})</option>
                    <option value="invalid_format">3️⃣ Invalid Format ({detailedIssues.filter(i => i.type === 'invalid_format').length})</option>
                    <option value="value_range">4️⃣ Value Range ({detailedIssues.filter(i => i.type === 'value_range').length})</option>
                    <option value="inconsistent">5️⃣ Inconsistent ({detailedIssues.filter(i => i.type === 'inconsistent').length})</option>
                    <option value="unusual_pattern">6️⃣ Unusual Patterns ({detailedIssues.filter(i => i.type === 'unusual_pattern').length})</option>
                    <option value="sensitive_data">7️⃣ Sensitive Data ({detailedIssues.filter(i => i.type === 'sensitive_data').length})</option>
                  </select>
                </div>

                {/* Issues List */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredIssues.slice(0, 50).map((issue, index) => (
                    <div key={index} className="bg-white border rounded-lg p-4 hover:shadow-sm transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${issueTypeColors[issue.type]}`}>
                              {issue.type.replace('_', ' ')}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${severityColors[issue.severity]}`}>
                              {issue.severity}
                            </span>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              Row #{issue.rowIndex + 1}
                            </span>
                            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                              {issue.dimension}
                            </span>
                          </div>
                          <p className="text-sm text-gray-900 mb-2 font-medium">{issue.description}</p>
                          <p className="text-xs text-gray-600 mb-2">Column: <strong>{issue.column}</strong></p>
                          <p className="text-xs text-green-700 bg-green-50 p-2 rounded">
                            💡 <strong>Recommendation:</strong> {issue.recommendation}
                          </p>
                        </div>
                        <div className="text-xs text-gray-500 ml-4 max-w-32 truncate">
                          {typeof issue.value === 'object' ? 'Row data' : String(issue.value)}
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredIssues.length > 50 && (
                    <div className="text-center py-4 text-gray-500">
                      ... and {filteredIssues.length - 50} more issues
                    </div>
                  )}
                  {filteredIssues.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No issues found matching your search criteria
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* AI-Ready Recommendations Section */}
        <div className="bg-white border rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('recommendations')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Strategic Recommendations</h3>
            </div>
            {expandedSections.has('recommendations') ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </button>
          
          {expandedSections.has('recommendations') && (
            <div className="px-6 pb-6 border-t bg-gray-50">
              <div className="pt-6 space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-blue-900 mb-2">📊 Analysis Summary for AI Insights</h4>
                  <p className="text-blue-800 text-sm">
                    This comprehensive 7-dimension analysis provides detailed context for AI-powered strategic recommendations. 
                    Use the AI Insights tab to get business-focused analysis and implementation guidance.
                  </p>
                </div>
                
                {report.recommendations.map((recommendation, index) => (
                  <div key={index} className={`border rounded-lg p-4 ${
                    recommendation.includes('CRITICAL') ? 'bg-red-50 border-red-200' :
                    recommendation.includes('WARNING') ? 'bg-orange-50 border-orange-200' :
                    recommendation.includes('PRIVACY') || recommendation.includes('COMPLIANCE') ? 'bg-purple-50 border-purple-200' :
                    'bg-green-50 border-green-200'
                  }`}>
                    <p className={`text-sm font-medium ${
                      recommendation.includes('CRITICAL') ? 'text-red-800' :
                      recommendation.includes('WARNING') ? 'text-orange-800' :
                      recommendation.includes('PRIVACY') || recommendation.includes('COMPLIANCE') ? 'text-purple-800' :
                      'text-green-800'
                    }`}>
                      {recommendation}
                    </p>
                  </div>
                ))}
                
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 mt-6">
                  <h4 className="font-medium text-gray-900 mb-2">🤖 Ready for AI Analysis</h4>
                  <p className="text-gray-700 text-sm mb-3">
                    This detailed quality assessment provides the foundation for AI-powered strategic insights. 
                    The AI can analyze these findings to provide:
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Business impact assessment and ROI calculations</li>
                    <li>• Prioritized action plans with implementation timelines</li>
                    <li>• Compliance risk evaluation and mitigation strategies</li>
                    <li>• Data governance recommendations and best practices</li>
                    <li>• Technical implementation guidance and tool suggestions</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QualityAnalysis;