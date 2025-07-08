import React, { useState, useEffect } from 'react';
import { Trash2, RefreshCw, Filter, CheckCircle, AlertTriangle, Eye, Play, Undo, Info, Zap, Target, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { CSVData, CleaningOperation } from '../types';

interface DataCleaningProps {
  data: CSVData;
  onDataCleaned: (cleanedData: CSVData) => void;
}

interface CleaningStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  borderColor: string;
  issues: number;
  operation: CleaningOperation;
  applied: boolean;
  affectedRows: number[];
  affectedColumns: string[];
  previewData?: {
    before: any[];
    after: any[];
  };
  selectedRows?: Set<number>; // For selective row cleaning
}

const DataCleaning: React.FC<DataCleaningProps> = ({ data, onDataCleaned }) => {
  const [cleaningSteps, setCleaningSteps] = useState<CleaningStep[]>([]);
  const [previewData, setPreviewData] = useState<CSVData>(data);
  const [isProcessing, setIsProcessing] = useState(false);
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [showGlobalPreview, setShowGlobalPreview] = useState(false);

  useEffect(() => {
    analyzeDataAndCreateSteps();
  }, [data]);

  const analyzeDataAndCreateSteps = () => {
    const steps: CleaningStep[] = [];

    // Check for duplicates with detailed preview
    const duplicateRowIndices: number[] = [];
    const seenRows = new Map();
    data.rows.forEach((row, index) => {
      const key = JSON.stringify(row);
      if (seenRows.has(key)) {
        duplicateRowIndices.push(index);
      } else {
        seenRows.set(key, index);
      }
    });
    
    if (duplicateRowIndices.length > 0) {
      const duplicatePreview = duplicateRowIndices.slice(0, 5).map(index => ({
        rowNumber: index + 1,
        data: data.rows[index],
        originalIndex: seenRows.get(JSON.stringify(data.rows[index]))
      }));

      steps.push({
        id: 'remove_duplicates',
        title: 'Remove Duplicate Rows',
        description: `Found ${duplicateRowIndices.length} duplicate rows. These are exact copies of existing rows and can be safely removed.`,
        icon: Trash2,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        issues: duplicateRowIndices.length,
        operation: {
          type: 'remove_duplicates',
          description: `Remove ${duplicateRowIndices.length} duplicate rows`
        },
        applied: false,
        affectedRows: duplicateRowIndices,
        affectedColumns: data.headers,
        previewData: {
          before: duplicatePreview,
          after: []
        }
      });
    }

    // Check for missing values with detailed column analysis
    data.headers.forEach(header => {
      const colIndex = data.headers.indexOf(header);
      const missingRowIndices: number[] = [];
      const missingValues: any[] = [];
      
      data.rows.forEach((row, rowIndex) => {
        if (row[colIndex] === '' || row[colIndex] === null || row[colIndex] === undefined) {
          missingRowIndices.push(rowIndex);
          missingValues.push({
            rowNumber: rowIndex + 1,
            rowData: row,
            columnIndex: colIndex,
            rowIndex: rowIndex
          });
        }
      });

      if (missingRowIndices.length > 0) {
        // Suggest appropriate fill value based on column type
        const nonEmptyValues = data.rows
          .map(row => row[colIndex])
          .filter(val => val !== '' && val !== null && val !== undefined);
        
        const numericValues = nonEmptyValues.filter(val => typeof val === 'number');
        let suggestedValue = '';
        
        if (numericValues.length > nonEmptyValues.length / 2) {
          // Numeric column - suggest mean
          const mean = numericValues.reduce((sum, val) => sum + val, 0) / numericValues.length;
          suggestedValue = Math.round(mean * 100) / 100;
        } else {
          // Text column - suggest most common value or 'Unknown'
          const valueCounts = new Map();
          nonEmptyValues.forEach(val => {
            valueCounts.set(val, (valueCounts.get(val) || 0) + 1);
          });
          const mostCommon = Array.from(valueCounts.entries()).sort((a, b) => b[1] - a[1])[0];
          suggestedValue = mostCommon ? mostCommon[0] : 'Unknown';
        }

        steps.push({
          id: `fill_missing_${header}`,
          title: `Fill Missing Values in "${header}"`,
          description: `${missingRowIndices.length} missing values found in this column. You can select which specific rows to fill.`,
          icon: Filter,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          issues: missingRowIndices.length,
          operation: {
            type: 'fill_missing',
            column: header,
            value: suggestedValue,
            description: `Fill missing values in ${header}`
          },
          applied: false,
          affectedRows: missingRowIndices,
          affectedColumns: [header],
          selectedRows: new Set(), // Start with no rows selected
          previewData: {
            before: missingValues.slice(0, 10), // Show more examples for selection
            after: missingValues.slice(0, 10).map(item => ({
              ...item,
              newValue: suggestedValue
            }))
          }
        });
      }
    });

    // Check for outliers with statistical analysis
    const numericColumns = data.headers.filter(header => {
      const colIndex = data.headers.indexOf(header);
      const values = data.rows.map(row => row[colIndex]);
      const numericValues = values.filter(val => typeof val === 'number');
      return numericValues.length > values.length / 2;
    });

    numericColumns.forEach(column => {
      const colIndex = data.headers.indexOf(column);
      const numericValues = data.rows
        .map((row, index) => ({ value: row[colIndex], index }))
        .filter(item => typeof item.value === 'number');

      if (numericValues.length > 4) {
        const sortedValues = numericValues.map(item => item.value).sort((a, b) => a - b);
        const q1 = sortedValues[Math.floor(sortedValues.length * 0.25)];
        const q3 = sortedValues[Math.floor(sortedValues.length * 0.75)];
        const iqr = q3 - q1;
        const lowerBound = q1 - 1.5 * iqr;
        const upperBound = q3 + 1.5 * iqr;
        
        const outlierItems = numericValues.filter(item => 
          item.value < lowerBound || item.value > upperBound
        );
        
        if (outlierItems.length > 0) {
          const outlierPreview = outlierItems.slice(0, 5).map(item => ({
            rowNumber: item.index + 1,
            value: item.value,
            rowData: data.rows[item.index],
            reason: item.value < lowerBound ? 'Below normal range' : 'Above normal range',
            bounds: { lower: lowerBound, upper: upperBound }
          }));

          steps.push({
            id: `remove_outliers_${column}`,
            title: `Remove Outliers from "${column}"`,
            description: `${outlierItems.length} statistical outliers detected. These values are significantly different from the normal range and may skew analysis.`,
            icon: Target,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
            borderColor: 'border-purple-200',
            issues: outlierItems.length,
            operation: {
              type: 'remove_outliers',
              column,
              description: `Remove ${outlierItems.length} outliers from ${column}`
            },
            applied: false,
            affectedRows: outlierItems.map(item => item.index),
            affectedColumns: [column],
            previewData: {
              before: outlierPreview,
              after: []
            }
          });
        }
      }
    });

    // Check for text standardization
    const textColumns = data.headers.filter(header => {
      const colIndex = data.headers.indexOf(header);
      const values = data.rows.map(row => row[colIndex]);
      const textValues = values.filter(val => typeof val === 'string');
      return textValues.length > values.length / 2;
    });

    textColumns.forEach(column => {
      const colIndex = data.headers.indexOf(column);
      const inconsistentRows: number[] = [];
      const inconsistentValues: any[] = [];
      
      data.rows.forEach((row, rowIndex) => {
        const value = row[colIndex];
        if (typeof value === 'string') {
          const standardized = value.trim().toLowerCase();
          if (value !== standardized || value.includes('  ')) {
            inconsistentRows.push(rowIndex);
            inconsistentValues.push({
              rowNumber: rowIndex + 1,
              original: value,
              standardized: standardized.replace(/\s+/g, ' '),
              rowData: row
            });
          }
        }
      });

      if (inconsistentRows.length > 0) {
        steps.push({
          id: `standardize_${column}`,
          title: `Standardize Text in "${column}"`,
          description: `${inconsistentRows.length} text values need formatting standardization (case, spacing, etc.).`,
          icon: Zap,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          issues: inconsistentRows.length,
          operation: {
            type: 'standardize',
            column,
            description: `Standardize ${inconsistentRows.length} text values in ${column}`
          },
          applied: false,
          affectedRows: inconsistentRows,
          affectedColumns: [column],
          previewData: {
            before: inconsistentValues.slice(0, 5),
            after: inconsistentValues.slice(0, 5)
          }
        });
      }
    });

    setCleaningSteps(steps);
  };

  const toggleStep = (stepId: string) => {
    setCleaningSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, applied: !step.applied } : step
    ));
  };

  const updateStepValue = (stepId: string, value: string) => {
    setCleaningSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { 
            ...step, 
            operation: { ...step.operation, value },
            previewData: step.previewData ? {
              ...step.previewData,
              after: step.previewData.before.map(item => ({
                ...item,
                newValue: value
              }))
            } : undefined
          } 
        : step
    ));
  };

  const toggleRowSelection = (stepId: string, rowIndex: number) => {
    setCleaningSteps(prev => prev.map(step => {
      if (step.id === stepId && step.selectedRows) {
        const newSelectedRows = new Set(step.selectedRows);
        if (newSelectedRows.has(rowIndex)) {
          newSelectedRows.delete(rowIndex);
        } else {
          newSelectedRows.add(rowIndex);
        }
        
        // Update operation description
        const selectedCount = newSelectedRows.size;
        const newDescription = selectedCount > 0 
          ? `Fill ${selectedCount} selected missing values in ${step.operation.column}`
          : `Fill missing values in ${step.operation.column}`;
        
        return {
          ...step,
          selectedRows: newSelectedRows,
          operation: {
            ...step.operation,
            description: newDescription
          }
        };
      }
      return step;
    }));
  };

  const selectAllRows = (stepId: string) => {
    setCleaningSteps(prev => prev.map(step => {
      if (step.id === stepId && step.selectedRows) {
        const allRows = new Set(step.affectedRows);
        return {
          ...step,
          selectedRows: allRows,
          operation: {
            ...step.operation,
            description: `Fill all ${allRows.size} missing values in ${step.operation.column}`
          }
        };
      }
      return step;
    }));
  };

  const selectNoneRows = (stepId: string) => {
    setCleaningSteps(prev => prev.map(step => {
      if (step.id === stepId && step.selectedRows) {
        return {
          ...step,
          selectedRows: new Set(),
          operation: {
            ...step.operation,
            description: `Fill missing values in ${step.operation.column}`
          }
        };
      }
      return step;
    }));
  };

  const applyAllSelectedSteps = async () => {
    setIsProcessing(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    let cleanedData = { ...data };
    const appliedSteps = cleaningSteps.filter(step => step.applied);
    
    for (const step of appliedSteps) {
      const operation = step.operation;
      
      switch (operation.type) {
        case 'remove_duplicates':
          const uniqueRows = new Map();
          const filteredRows = cleanedData.rows.filter(row => {
            const key = JSON.stringify(row);
            if (uniqueRows.has(key)) {
              return false;
            }
            uniqueRows.set(key, true);
            return true;
          });
          cleanedData = { ...cleanedData, rows: filteredRows };
          break;
          
        case 'fill_missing':
          if (operation.column && operation.value !== undefined) {
            const colIndex = cleanedData.headers.indexOf(operation.column);
            if (colIndex !== -1) {
              cleanedData.rows = cleanedData.rows.map((row, rowIndex) => {
                const newRow = [...row];
                // Check if this row should be filled (either all rows or selected rows)
                const shouldFill = !step.selectedRows || step.selectedRows.size === 0 || step.selectedRows.has(rowIndex);
                
                if (shouldFill && (newRow[colIndex] === '' || newRow[colIndex] === null || newRow[colIndex] === undefined)) {
                  newRow[colIndex] = operation.value;
                }
                return newRow;
              });
            }
          }
          break;
          
        case 'remove_outliers':
          if (operation.column) {
            const colIndex = cleanedData.headers.indexOf(operation.column);
            if (colIndex !== -1) {
              const numericValues = cleanedData.rows
                .map(row => row[colIndex])
                .filter(val => typeof val === 'number')
                .sort((a, b) => a - b);
              
              if (numericValues.length > 0) {
                const q1 = numericValues[Math.floor(numericValues.length * 0.25)];
                const q3 = numericValues[Math.floor(numericValues.length * 0.75)];
                const iqr = q3 - q1;
                const lowerBound = q1 - 1.5 * iqr;
                const upperBound = q3 + 1.5 * iqr;
                
                cleanedData.rows = cleanedData.rows.filter(row => {
                  const value = row[colIndex];
                  return typeof value !== 'number' || (value >= lowerBound && value <= upperBound);
                });
              }
            }
          }
          break;
          
        case 'standardize':
          if (operation.column) {
            const colIndex = cleanedData.headers.indexOf(operation.column);
            if (colIndex !== -1) {
              cleanedData.rows = cleanedData.rows.map(row => {
                const newRow = [...row];
                if (typeof newRow[colIndex] === 'string') {
                  newRow[colIndex] = (newRow[colIndex] as string).trim().toLowerCase().replace(/\s+/g, ' ');
                }
                return newRow;
              });
            }
          }
          break;
      }
    }
    
    cleanedData.filename = `cleaned_${data.filename}`;
    setPreviewData(cleanedData);
    onDataCleaned(cleanedData);
    setIsProcessing(false);
  };

  const resetAllSteps = () => {
    setCleaningSteps(prev => prev.map(step => ({ 
      ...step, 
      applied: false,
      selectedRows: step.selectedRows ? new Set() : undefined
    })));
    setPreviewData(data);
  };

  const selectedStepsCount = cleaningSteps.filter(step => step.applied).length;
  const totalIssues = cleaningSteps.reduce((sum, step) => sum + step.issues, 0);

  const renderStepPreview = (step: CleaningStep) => {
    if (!step.previewData) return null;

    return (
      <div className="mt-4 space-y-4">
        <div className="flex items-center gap-2 mb-3">
          <Eye className="w-4 h-4 text-gray-500" />
          <span className="font-medium text-gray-900">Affected Data Preview</span>
          <span className="text-sm text-gray-500">
            (Showing up to {Math.min(step.previewData.before.length, 10)} examples of {step.issues} total)
          </span>
        </div>

        {step.operation.type === 'remove_duplicates' && (
          <div className="space-y-3">
            <div className="text-sm font-medium text-red-700 mb-2">
              🗑️ These duplicate rows will be removed:
            </div>
            {step.previewData.before.map((item: any, index) => (
              <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-red-800">
                    Row #{item.rowNumber} (duplicate of row #{item.originalIndex + 1})
                  </span>
                  <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
                    Will be deleted
                  </span>
                </div>
                <div className="text-xs text-red-700 font-mono bg-red-100 p-2 rounded">
                  {item.data.slice(0, 4).map((cell: any, i: number) => (
                    <span key={i} className="mr-4">
                      {data.headers[i]}: {String(cell)}
                    </span>
                  ))}
                  {item.data.length > 4 && <span>... +{item.data.length - 4} more</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {step.operation.type === 'fill_missing' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium text-yellow-700">
                ✏️ Select which missing values to fill:
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => selectAllRows(step.id)}
                  className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
                >
                  Select All
                </button>
                <button
                  onClick={() => selectNoneRows(step.id)}
                  className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  Select None
                </button>
              </div>
            </div>
            
            <div className="text-xs text-yellow-600 mb-2">
              Selected: {step.selectedRows?.size || 0} of {step.issues} missing values
            </div>
            
            {step.previewData.after.map((item: any, index) => {
              const isSelected = step.selectedRows?.has(item.rowIndex) || false;
              return (
                <div key={index} className={`border rounded-lg p-3 transition-all ${
                  isSelected 
                    ? 'bg-yellow-50 border-yellow-300' 
                    : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleRowSelection(step.id, item.rowIndex)}
                        className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                      />
                      <span className="text-sm font-medium text-gray-800">
                        Row #{item.rowNumber} - Column "{step.operation.column}"
                      </span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      isSelected 
                        ? 'text-yellow-600 bg-yellow-100' 
                        : 'text-gray-500 bg-gray-100'
                    }`}>
                      {isSelected ? 'Will be filled' : 'Not selected'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-gray-700 font-medium">Before:</span>
                      <div className="bg-gray-100 p-2 rounded mt-1 text-gray-600">
                        <span className="italic">empty</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-700 font-medium">After:</span>
                      <div className={`p-2 rounded mt-1 ${
                        isSelected ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {String(item.newValue)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Show context of the row */}
                  <div className="mt-2 text-xs text-gray-500">
                    <span className="font-medium">Row context:</span>
                    <div className="bg-gray-100 p-2 rounded mt-1 font-mono">
                      {item.rowData.slice(0, 3).map((cell: any, i: number) => (
                        <span key={i} className="mr-3">
                          {data.headers[i]}: {cell || 'empty'}
                        </span>
                      ))}
                      {item.rowData.length > 3 && <span>...</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {step.operation.type === 'remove_outliers' && (
          <div className="space-y-3">
            <div className="text-sm font-medium text-purple-700 mb-2">
              🎯 These outlier rows will be removed:
            </div>
            {step.previewData.before.map((item: any, index) => (
              <div key={index} className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-purple-800">
                    Row #{item.rowNumber} - {item.reason}
                  </span>
                  <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded">
                    Will be removed
                  </span>
                </div>
                <div className="text-xs text-purple-700">
                  <div className="mb-1">
                    <strong>Value:</strong> {item.value} (Normal range: {Math.round(item.bounds.lower * 100) / 100} - {Math.round(item.bounds.upper * 100) / 100})
                  </div>
                  <div className="bg-purple-100 p-2 rounded font-mono">
                    {item.rowData.slice(0, 4).map((cell: any, i: number) => (
                      <span key={i} className="mr-4">
                        {data.headers[i]}: {String(cell)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {step.operation.type === 'standardize' && (
          <div className="space-y-3">
            <div className="text-sm font-medium text-blue-700 mb-2">
              ⚡ These text values will be standardized:
            </div>
            {step.previewData.before.map((item: any, index) => (
              <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-800">
                    Row #{item.rowNumber}
                  </span>
                  <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                    Will be standardized
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-blue-700 font-medium">Before:</span>
                    <div className="bg-blue-100 p-2 rounded mt-1 text-blue-800 font-mono">
                      "{item.original}"
                    </div>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">After:</span>
                    <div className="bg-green-100 p-2 rounded mt-1 text-green-800 font-mono">
                      "{item.standardized}"
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <RefreshCw className="w-6 h-6 text-kipi-primary" />
          <h2 className="text-2xl font-bold text-gray-900">Smart Data Cleaning</h2>
        </div>
        
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Cleaning Overview</h3>
              <p className="text-gray-600">
                We've analyzed your data and found {cleaningSteps.length} potential improvements. 
                For missing values, you can select specific rows to fill or apply to the entire column.
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-kipi-primary">{totalIssues}</div>
              <div className="text-sm text-gray-600">Issues Found</div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg">
              <div className="text-lg font-semibold text-gray-900">{cleaningSteps.length}</div>
              <div className="text-sm text-gray-600">Available Operations</div>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <div className="text-lg font-semibold text-kipi-secondary">{selectedStepsCount}</div>
              <div className="text-sm text-gray-600">Selected Operations</div>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <div className="text-lg font-semibold text-gray-900">{data.rows.length}</div>
              <div className="text-sm text-gray-600">Original Rows</div>
            </div>
          </div>
        </div>
      </div>

      {cleaningSteps.length === 0 ? (
        <div className="text-center py-12">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Great News!</h3>
          <p className="text-gray-600 mb-4">
            Your data appears to be in excellent condition. No cleaning operations are needed.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-sm text-green-700">
              Your dataset has no duplicates, missing values, or obvious quality issues. 
              You can proceed directly to export your data.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Cleaning Steps */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended Cleaning Operations</h3>
            
            {cleaningSteps.map((step) => {
              const Icon = step.icon;
              const isSelected = step.applied;
              const isExpanded = expandedStep === step.id;
              const selectedRowsCount = step.selectedRows?.size || 0;
              
              return (
                <div
                  key={step.id}
                  className={`border-2 rounded-lg transition-all ${
                    isSelected 
                      ? `${step.borderColor} ${step.bgColor}` 
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${step.bgColor}`}>
                        <Icon className={`w-6 h-6 ${step.color}`} />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-lg font-semibold text-gray-900">{step.title}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            step.issues > 10 ? 'bg-red-100 text-red-800' :
                            step.issues > 5 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {step.issues} issues
                          </span>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            Affects {step.affectedRows.length} rows
                          </span>
                          {step.operation.type === 'fill_missing' && selectedRowsCount > 0 && (
                            <span className="text-xs text-yellow-700 bg-yellow-100 px-2 py-1 rounded">
                              {selectedRowsCount} selected
                            </span>
                          )}
                        </div>
                        
                        <p className="text-gray-600 mb-4">{step.description}</p>
                        
                        <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
                          <span className="font-medium">Affected columns:</span>
                          {step.affectedColumns.map((col, index) => (
                            <span key={index} className="bg-gray-100 px-2 py-1 rounded text-xs">
                              {col}
                            </span>
                          ))}
                        </div>
                        
                        {step.operation.type === 'fill_missing' && (
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Fill value for missing entries:
                            </label>
                            <input
                              type="text"
                              value={step.operation.value || ''}
                              onChange={(e) => updateStepValue(step.id, e.target.value)}
                              placeholder="Enter default value"
                              className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-kipi-primary"
                            />
                            <div className="mt-2 text-xs text-gray-500">
                              {selectedRowsCount > 0 
                                ? `Will fill ${selectedRowsCount} selected missing values`
                                : `Will fill all ${step.issues} missing values when applied`
                              }
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => toggleStep(step.id)}
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                              isSelected
                                ? 'bg-kipi-primary text-white hover:bg-green-600'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            <CheckCircle className="w-4 h-4" />
                            {isSelected ? 'Selected' : 'Select Operation'}
                          </button>
                          
                          <button
                            onClick={() => setExpandedStep(isExpanded ? null : step.id)}
                            className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
                          >
                            <Eye className="w-4 h-4" />
                            {isExpanded ? 'Hide Preview' : 'Show Affected Data'}
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>
                        
                        {isExpanded && renderStepPreview(step)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="bg-white border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Apply Cleaning Operations</h3>
                <p className="text-gray-600">
                  {selectedStepsCount > 0 
                    ? `${selectedStepsCount} operation${selectedStepsCount > 1 ? 's' : ''} selected`
                    : 'Select operations above to clean your data'
                  }
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowGlobalPreview(!showGlobalPreview)}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Eye className="w-4 h-4" />
                  {showGlobalPreview ? 'Hide Final Preview' : 'Show Final Preview'}
                </button>
                
                <button
                  onClick={resetAllSteps}
                  disabled={selectedStepsCount === 0}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  <Undo className="w-4 h-4" />
                  Reset All
                </button>
                
                <button
                  onClick={applyAllSelectedSteps}
                  disabled={selectedStepsCount === 0 || isProcessing}
                  className="inline-flex items-center gap-2 px-6 py-2 bg-kipi-primary text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Apply Selected Operations
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {selectedStepsCount > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Selected Operations Summary:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  {cleaningSteps.filter(step => step.applied).map(step => (
                    <li key={step.id}>• {step.operation.description}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Global Preview */}
          {showGlobalPreview && (
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Final Data Preview</h3>
              <div className="text-sm text-gray-600 mb-4">
                Showing preview of {previewData.rows.length} rows × {previewData.headers.length} columns
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      {previewData.headers.slice(0, 6).map((header, index) => (
                        <th key={index} className="px-3 py-2 text-left font-medium text-gray-900">
                          {header}
                        </th>
                      ))}
                      {previewData.headers.length > 6 && (
                        <th className="px-3 py-2 text-left font-medium text-gray-500">
                          ... +{previewData.headers.length - 6} more
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.rows.slice(0, 8).map((row, rowIndex) => (
                      <tr key={rowIndex} className="border-t">
                        {row.slice(0, 6).map((cell, cellIndex) => (
                          <td key={cellIndex} className="px-3 py-2 text-gray-700">
                            {cell === '' || cell === null || cell === undefined ? (
                              <span className="text-gray-400 italic">empty</span>
                            ) : (
                              String(cell).length > 30 ? String(cell).substring(0, 30) + '...' : String(cell)
                            )}
                          </td>
                        ))}
                        {row.length > 6 && (
                          <td className="px-3 py-2 text-gray-400">...</td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {previewData.rows.length > 8 && (
                <div className="mt-3 text-sm text-gray-500 text-center">
                  ... and {previewData.rows.length - 8} more rows
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DataCleaning;