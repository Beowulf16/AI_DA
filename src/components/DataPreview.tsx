import React, { useState, useMemo } from 'react';
import { FileText, ChevronLeft, ChevronRight, Info, Search, Filter, BarChart3, Eye, Download, Grid, List, SortAsc, SortDesc } from 'lucide-react';
import { CSVData } from '../types';

interface DataPreviewProps {
  data: CSVData;
}

interface ColumnFilter {
  column: string;
  value: string;
  type: 'contains' | 'equals' | 'greater' | 'less';
}

const DataPreview: React.FC<DataPreviewProps> = ({ data }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedColumns, setSelectedColumns] = useState<Set<string>>(new Set(data.headers));
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ColumnFilter[]>([]);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);

  // Advanced filtering and sorting
  const filteredAndSortedData = useMemo(() => {
    let processedRows = [...data.rows];

    // Apply search filter
    if (searchTerm) {
      processedRows = processedRows.filter(row =>
        row.some(cell => 
          String(cell).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply column filters
    filters.forEach(filter => {
      const colIndex = data.headers.indexOf(filter.column);
      if (colIndex !== -1) {
        processedRows = processedRows.filter(row => {
          const cellValue = String(row[colIndex]).toLowerCase();
          const filterValue = filter.value.toLowerCase();
          
          switch (filter.type) {
            case 'contains':
              return cellValue.includes(filterValue);
            case 'equals':
              return cellValue === filterValue;
            case 'greater':
              return Number(row[colIndex]) > Number(filter.value);
            case 'less':
              return Number(row[colIndex]) < Number(filter.value);
            default:
              return true;
          }
        });
      }
    });

    // Apply sorting
    if (sortColumn) {
      const colIndex = data.headers.indexOf(sortColumn);
      processedRows.sort((a, b) => {
        const aVal = a[colIndex];
        const bVal = b[colIndex];
        
        // Handle different data types
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        } else {
          const aStr = String(aVal).toLowerCase();
          const bStr = String(bVal).toLowerCase();
          if (sortDirection === 'asc') {
            return aStr.localeCompare(bStr);
          } else {
            return bStr.localeCompare(aStr);
          }
        }
      });
    }

    return processedRows;
  }, [data.rows, searchTerm, filters, sortColumn, sortDirection]);

  const totalPages = Math.ceil(filteredAndSortedData.length / rowsPerPage);
  const currentPageData = filteredAndSortedData.slice(
    currentPage * rowsPerPage,
    (currentPage + 1) * rowsPerPage
  );

  const visibleHeaders = data.headers.filter(header => selectedColumns.has(header));

  const getColumnStats = (columnIndex: number) => {
    const values = data.rows.map(row => row[columnIndex]);
    const nonEmptyValues = values.filter(v => v !== '' && v !== null && v !== undefined);
    const numericValues = nonEmptyValues.filter(v => typeof v === 'number');
    const uniqueValues = new Set(nonEmptyValues);
    
    let stats: any = {
      total: values.length,
      nonEmpty: nonEmptyValues.length,
      empty: values.length - nonEmptyValues.length,
      unique: uniqueValues.size,
      duplicates: nonEmptyValues.length - uniqueValues.size
    };

    if (numericValues.length > 0) {
      const sorted = [...numericValues].sort((a, b) => a - b);
      stats.numeric = {
        count: numericValues.length,
        min: sorted[0],
        max: sorted[sorted.length - 1],
        mean: numericValues.reduce((sum, val) => sum + val, 0) / numericValues.length,
        median: sorted[Math.floor(sorted.length / 2)]
      };
    }

    return stats;
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const toggleColumnVisibility = (column: string) => {
    const newSelected = new Set(selectedColumns);
    if (newSelected.has(column)) {
      newSelected.delete(column);
    } else {
      newSelected.add(column);
    }
    setSelectedColumns(newSelected);
  };

  const addFilter = () => {
    setFilters([...filters, { column: data.headers[0], value: '', type: 'contains' }]);
  };

  const updateFilter = (index: number, field: keyof ColumnFilter, value: string) => {
    const newFilters = [...filters];
    newFilters[index] = { ...newFilters[index], [field]: value };
    setFilters(newFilters);
  };

  const removeFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const exportFilteredData = () => {
    const csvContent = [
      visibleHeaders.join(','),
      ...filteredAndSortedData.map(row => 
        visibleHeaders.map(header => {
          const colIndex = data.headers.indexOf(header);
          return String(row[colIndex]);
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `filtered_${data.filename}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-kipi-secondary" />
            <h2 className="text-2xl font-bold text-gray-900">Advanced Data Preview</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}
              className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {viewMode === 'table' ? <Grid className="w-4 h-4" /> : <List className="w-4 h-4" />}
              {viewMode === 'table' ? 'Card View' : 'Table View'}
            </button>
            <button
              onClick={exportFilteredData}
              className="inline-flex items-center gap-2 px-3 py-2 bg-kipi-secondary text-white rounded-lg hover:bg-blue-700"
            >
              <Download className="w-4 h-4" />
              Export Filtered
            </button>
          </div>
        </div>
        
        {/* Dataset Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
            <h3 className="font-medium text-green-900 mb-1">File Name</h3>
            <p className="text-green-700 text-sm truncate">{data.filename}</p>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-1">Total Rows</h3>
            <p className="text-2xl font-bold text-blue-700">{data.rows.length.toLocaleString()}</p>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
            <h3 className="font-medium text-purple-900 mb-1">Columns</h3>
            <p className="text-2xl font-bold text-purple-700">{data.headers.length}</p>
          </div>
          <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-4 rounded-lg">
            <h3 className="font-medium text-amber-900 mb-1">Filtered Rows</h3>
            <p className="text-2xl font-bold text-amber-700">{filteredAndSortedData.length.toLocaleString()}</p>
          </div>
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-1">Data Size</h3>
            <p className="text-2xl font-bold text-gray-700">
              {(data.rows.length * data.headers.length).toLocaleString()} cells
            </p>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="bg-white border rounded-lg p-4 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search across all columns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kipi-primary"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="w-4 h-4" />
              Filters {filters.length > 0 && `(${filters.length})`}
            </button>
            <select
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kipi-primary"
            >
              <option value={10}>10 rows</option>
              <option value={25}>25 rows</option>
              <option value={50}>50 rows</option>
              <option value={100}>100 rows</option>
            </select>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">Column Filters</h4>
                <button
                  onClick={addFilter}
                  className="text-sm px-3 py-1 bg-kipi-primary text-white rounded hover:bg-green-600"
                >
                  Add Filter
                </button>
              </div>
              <div className="space-y-2">
                {filters.map((filter, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <select
                      value={filter.column}
                      onChange={(e) => updateFilter(index, 'column', e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                    >
                      {data.headers.map(header => (
                        <option key={header} value={header}>{header}</option>
                      ))}
                    </select>
                    <select
                      value={filter.type}
                      onChange={(e) => updateFilter(index, 'type', e.target.value as any)}
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                    >
                      <option value="contains">Contains</option>
                      <option value="equals">Equals</option>
                      <option value="greater">Greater than</option>
                      <option value="less">Less than</option>
                    </select>
                    <input
                      type="text"
                      value={filter.value}
                      onChange={(e) => updateFilter(index, 'value', e.target.value)}
                      placeholder="Filter value..."
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                    <button
                      onClick={() => removeFilter(index)}
                      className="text-red-600 hover:text-red-800 text-sm px-2"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Column Visibility */}
          <div className="border-t pt-4 mt-4">
            <h4 className="font-medium text-gray-900 mb-3">Visible Columns</h4>
            <div className="flex flex-wrap gap-2">
              {data.headers.map(header => (
                <button
                  key={header}
                  onClick={() => toggleColumnVisibility(header)}
                  className={`px-3 py-1 rounded-full text-sm transition-all ${
                    selectedColumns.has(header)
                      ? 'bg-kipi-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {header}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Column Statistics */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Column Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleHeaders.map((header, index) => {
            const colIndex = data.headers.indexOf(header);
            const stats = getColumnStats(colIndex);
            return (
              <div key={header} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900 truncate">{header}</h4>
                  <button
                    onClick={() => handleSort(header)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {sortColumn === header ? (
                      sortDirection === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                    ) : (
                      <BarChart3 className="w-4 h-4" />
                    )}
                  </button>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-medium">{stats.total}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Non-empty:</span>
                    <span className="font-medium text-green-600">{stats.nonEmpty}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Empty:</span>
                    <span className="font-medium text-red-600">{stats.empty}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Unique:</span>
                    <span className="font-medium text-blue-600">{stats.unique}</span>
                  </div>
                  {stats.duplicates > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Duplicates:</span>
                      <span className="font-medium text-amber-600">{stats.duplicates}</span>
                    </div>
                  )}
                  
                  {stats.numeric && (
                    <div className="pt-2 border-t">
                      <div className="text-xs text-gray-500 mb-1">Numeric Stats:</div>
                      <div className="grid grid-cols-2 gap-1 text-xs">
                        <div>Min: <span className="font-medium">{stats.numeric.min}</span></div>
                        <div>Max: <span className="font-medium">{stats.numeric.max}</span></div>
                        <div>Mean: <span className="font-medium">{Math.round(stats.numeric.mean * 100) / 100}</span></div>
                        <div>Median: <span className="font-medium">{stats.numeric.median}</span></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Data Display */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {viewMode === 'table' ? 'Data Table' : 'Data Cards'}
            </h3>
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                Showing {Math.min(rowsPerPage, filteredAndSortedData.length - currentPage * rowsPerPage)} of {filteredAndSortedData.length} rows
                {searchTerm || filters.length > 0 ? ` (filtered from ${data.rows.length} total)` : ''}
              </span>
            </div>
          </div>
        </div>
        
        {viewMode === 'table' ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  {visibleHeaders.map((header) => (
                    <th 
                      key={header} 
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort(header)}
                    >
                      <div className="flex items-center gap-1">
                        {header}
                        {sortColumn === header && (
                          sortDirection === 'asc' ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />
                        )}
                      </div>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentPageData.map((row, rowIndex) => {
                  const actualRowIndex = currentPage * rowsPerPage + rowIndex;
                  return (
                    <tr 
                      key={actualRowIndex} 
                      className={`hover:bg-gray-50 ${selectedRow === actualRowIndex ? 'bg-blue-50' : ''}`}
                    >
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {actualRowIndex + 1}
                      </td>
                      {visibleHeaders.map((header) => {
                        const colIndex = data.headers.indexOf(header);
                        const cell = row[colIndex];
                        return (
                          <td key={header} className="px-4 py-3 text-sm text-gray-900">
                            {cell === '' || cell === null || cell === undefined ? (
                              <span className="text-gray-400 italic">empty</span>
                            ) : (
                              <span className={typeof cell === 'number' ? 'font-mono' : ''}>
                                {String(cell).length > 50 ? String(cell).substring(0, 50) + '...' : String(cell)}
                              </span>
                            )}
                          </td>
                        );
                      })}
                      <td className="px-4 py-3 text-sm">
                        <button
                          onClick={() => setSelectedRow(selectedRow === actualRowIndex ? null : actualRowIndex)}
                          className="text-kipi-secondary hover:text-blue-700"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentPageData.map((row, rowIndex) => {
              const actualRowIndex = currentPage * rowsPerPage + rowIndex;
              return (
                <div key={actualRowIndex} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-500">Row #{actualRowIndex + 1}</span>
                    <button
                      onClick={() => setSelectedRow(selectedRow === actualRowIndex ? null : actualRowIndex)}
                      className="text-kipi-secondary hover:text-blue-700"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {visibleHeaders.slice(0, 4).map((header) => {
                      const colIndex = data.headers.indexOf(header);
                      const cell = row[colIndex];
                      return (
                        <div key={header} className="flex justify-between">
                          <span className="text-sm text-gray-600 truncate">{header}:</span>
                          <span className="text-sm font-medium text-gray-900 ml-2">
                            {cell === '' || cell === null || cell === undefined ? (
                              <span className="text-gray-400 italic">empty</span>
                            ) : (
                              String(cell).length > 20 ? String(cell).substring(0, 20) + '...' : String(cell)
                            )}
                          </span>
                        </div>
                      );
                    })}
                    {visibleHeaders.length > 4 && (
                      <div className="text-xs text-gray-500 text-center pt-2">
                        ... and {visibleHeaders.length - 4} more columns
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Row Detail Modal */}
        {selectedRow !== null && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Row #{selectedRow + 1} Details</h3>
                <button
                  onClick={() => setSelectedRow(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.headers.map((header, index) => {
                  const cell = filteredAndSortedData[selectedRow - currentPage * rowsPerPage]?.[index];
                  return (
                    <div key={header} className="border rounded-lg p-3">
                      <div className="text-sm font-medium text-gray-700 mb-1">{header}</div>
                      <div className="text-sm text-gray-900">
                        {cell === '' || cell === null || cell === undefined ? (
                          <span className="text-gray-400 italic">empty</span>
                        ) : (
                          <span className={typeof cell === 'number' ? 'font-mono' : ''}>{String(cell)}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">
                Page {currentPage + 1} of {totalPages} 
                ({filteredAndSortedData.length} total rows)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(0)}
                  disabled={currentPage === 0}
                  className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  ⟪
                </button>
                <button
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                  className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-3 py-2 text-sm">
                  {Math.max(1, currentPage - 1)} ... {Math.min(totalPages, currentPage + 3)}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                  disabled={currentPage === totalPages - 1}
                  className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages - 1)}
                  disabled={currentPage === totalPages - 1}
                  className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  ⟫
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataPreview;