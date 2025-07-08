import React, { useState } from 'react';
import { BookOpen, Download, FileText, Shield, Calculator, BarChart3, ChevronDown, ChevronRight, Lock, Eye, Database, Brain, Zap, Target, AlertTriangle, CheckCircle } from 'lucide-react';

const Documentation: React.FC = () => {
  const [expandedSections, setExpandedSections] = useState<string[]>(['overview']);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const downloadDocumentation = () => {
    const docContent = `# Kipi.ai Data Quality Analysis Platform
## Comprehensive Technical Documentation & User Guide

### Version: 2.0 | Generated: ${new Date().toLocaleDateString()}

---

## 📋 TABLE OF CONTENTS

1. [Executive Summary](#executive-summary)
2. [Platform Architecture](#platform-architecture)
3. [7-Dimension Quality Framework](#7-dimension-quality-framework)
4. [Scoring Methodology & Formulas](#scoring-methodology--formulas)
5. [AI Integration & Models](#ai-integration--models)
6. [Security & Privacy Protocols](#security--privacy-protocols)
7. [Data Processing Pipeline](#data-processing-pipeline)
8. [User Interface & Features](#user-interface--features)
9. [Compliance & Regulatory Framework](#compliance--regulatory-framework)
10. [Technical Implementation](#technical-implementation)
11. [Best Practices & Guidelines](#best-practices--guidelines)
12. [Troubleshooting & Support](#troubleshooting--support)

---

## 🎯 EXECUTIVE SUMMARY

The Kipi.ai Data Quality Analysis Platform is an enterprise-grade, browser-based application designed to provide comprehensive data quality assessment using industry-standard methodologies. Built with modern web technologies and powered by advanced AI models, the platform offers real-time analysis, intelligent insights, and automated cleaning capabilities while maintaining the highest standards of data privacy and security.

### Key Capabilities
- **7-Dimension Quality Framework**: Industry-standard comprehensive analysis
- **AI-Powered Insights**: Strategic recommendations using multiple AI models
- **Real-Time Processing**: Client-side analysis with no data transmission
- **Privacy-First Design**: Zero data retention, complete user control
- **Enterprise Security**: Bank-level encryption and security protocols
- **Compliance Ready**: GDPR, CCPA, HIPAA consideration framework

---

## 🏗️ PLATFORM ARCHITECTURE

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development
- **Styling**: Tailwind CSS for responsive, professional design system
- **Icons**: Lucide React for consistent, scalable iconography
- **Build Tool**: Vite for optimized development and production builds
- **State Management**: React hooks with optimized re-rendering

### Component Structure
\`\`\`
src/
├── components/
│   ├── FileUpload.tsx          # Drag-drop CSV upload interface
│   ├── DataPreview.tsx         # Advanced table with filtering/sorting
│   ├── QualityAnalysis.tsx     # 7-dimension analysis engine
│   ├── AIInsights.tsx          # AI model integration & insights
│   ├── DataCleaning.tsx        # Smart cleaning operations
│   ├── ExportData.tsx          # Multi-format export functionality
│   └── Documentation.tsx       # This comprehensive guide
├── types/
│   └── index.ts                # TypeScript interfaces & types
└── App.tsx                     # Main application orchestrator
\`\`\`

### Performance Optimizations
- **Lazy Loading**: Components loaded on-demand
- **Memory Management**: Efficient handling of large datasets (100K+ rows)
- **Virtual Scrolling**: Smooth navigation through massive datasets
- **Background Processing**: Non-blocking operations for better UX
- **Caching**: Intelligent caching of analysis results

---

## 📊 7-DIMENSION QUALITY FRAMEWORK

Our platform implements the industry-standard 7-dimension data quality framework, providing comprehensive coverage of all data quality aspects:

### 1️⃣ Missing Values (Weight: 20%)
**What It Checks**: Blanks, nulls, empty fields, and common missing indicators
**Detection Logic**:
- Empty strings ('')
- Null/undefined values
- Common missing indicators: 'null', 'NULL', 'N/A', 'n/a'
- Whitespace-only fields

**Business Impact**: Missing data reduces analytical accuracy and can lead to biased insights
**Severity Levels**:
- Low: <5% missing values
- Medium: 5-15% missing values
- High: 15-30% missing values
- Critical: >30% missing values

### 2️⃣ Duplicates (Weight: 15%)
**What It Checks**: Exact duplicate rows or repeated key values
**Detection Logic**:
- JSON serialization for exact row comparison
- Byte-level duplicate detection
- Preserves first occurrence, flags subsequent duplicates

**Business Impact**: Duplicates skew statistics, inflate counts, and waste storage
**Severity Levels**:
- Low: <2% duplicates
- Medium: 2-5% duplicates
- High: 5-10% duplicates
- Critical: >10% duplicates

### 3️⃣ Invalid Format (Weight: 15%)
**What It Checks**: Values not following expected format or type
**Detection Patterns**:
- **Email**: \`^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$\`
- **Phone**: \`^[\\+]?[1-9][\\d]{9,14}$\` (10-15 digits)
- **Date**: \`YYYY-MM-DD\`, \`MM/DD/YYYY\`, \`DD-MM-YYYY\`
- **Numeric**: Type validation and range checking

**Business Impact**: Format inconsistencies prevent proper data integration and analysis
**Auto-Detection**: Column type inference based on content patterns

### 4️⃣ Value Range (Weight: 15%)
**What It Checks**: Values within acceptable or expected ranges
**Range Validations**:
- **Age**: 0-150 years (realistic human age range)
- **Salary**: Non-negative values, reasonable upper bounds
- **Dates**: No future birth dates, realistic historical ranges
- **Phone Length**: 10-15 digits after cleaning

**Business Impact**: Out-of-range values indicate data entry errors or system issues
**Dynamic Thresholds**: Context-aware range validation based on field names

### 5️⃣ Inconsistent Values (Weight: 10%)
**What It Checks**: Consistency across similar fields and logical relationships
**Consistency Checks**:
- **Text Formatting**: Mixed case, extra whitespace, special characters
- **Logical Relationships**: Ship date vs. Order date validation
- **Cross-Field Validation**: Related field consistency
- **Standardization**: Uniform formatting across similar fields

**Business Impact**: Inconsistencies reduce data reliability and complicate analysis
**Smart Detection**: Context-aware relationship validation

### 6️⃣ Unusual Patterns (Weight: 10%)
**What It Checks**: Rare, fake, or suspicious values that may indicate test data
**Pattern Detection**:
- **Repeated Characters**: 9999999999, aaaaaaa
- **Sequential Patterns**: 1234567890, abcdefghij
- **Test Data Indicators**: 'test', 'dummy', 'sample', 'placeholder'
- **Suspicious Emails**: test@, dummy@, example@

**Business Impact**: Test data in production can skew analysis and violate compliance
**Machine Learning**: Pattern recognition for anomaly detection

### 7️⃣ Sensitive Data - PII (Weight: 15%)
**What It Checks**: Personal or risky information requiring special handling
**PII Detection Patterns**:
- **Email Addresses**: Full email validation and flagging
- **Phone Numbers**: International and domestic format detection
- **SSN**: XXX-XX-XXXX and 9-digit patterns
- **Credit Cards**: 16-digit patterns with validation

**Business Impact**: Unprotected PII creates compliance risks and privacy violations
**Compliance Framework**: GDPR, CCPA, HIPAA consideration guidelines

---

## 🧮 SCORING METHODOLOGY & FORMULAS

### Overall Quality Score Calculation
\`\`\`
Overall Score = (
  Missing Values Score × 0.20 +
  Duplicates Score × 0.15 +
  Invalid Format Score × 0.15 +
  Value Range Score × 0.15 +
  Inconsistent Values Score × 0.10 +
  Unusual Patterns Score × 0.10 +
  Sensitive Data Score × 0.15
)
\`\`\`

### Individual Dimension Scoring

#### 1. Missing Values Score
\`\`\`
Missing Values Score = ((Total Cells - Missing Cells) / Total Cells) × 100
Where: Total Cells = Rows × Columns
\`\`\`

#### 2. Duplicates Score
\`\`\`
Duplicates Score = ((Total Rows - Duplicate Rows) / Total Rows) × 100
\`\`\`

#### 3. Invalid Format Score
\`\`\`
Invalid Format Score = max(0, 100 - (Format Issues / Total Rows) × 100)
\`\`\`

#### 4. Value Range Score
\`\`\`
Value Range Score = max(0, 100 - (Range Violations / Total Rows) × 100)
\`\`\`

#### 5. Inconsistent Values Score
\`\`\`
Inconsistent Values Score = max(0, 100 - (Inconsistencies / Total Rows) × 100)
\`\`\`

#### 6. Unusual Patterns Score
\`\`\`
Unusual Patterns Score = max(0, 100 - (Unusual Patterns / Total Rows) × 100)
\`\`\`

#### 7. Sensitive Data Score
\`\`\`
Sensitive Data Score = PII Detected ? max(0, 100 - (PII Instances / Total Rows) × 100) : 100
\`\`\`

### Grade Assignment
- **A+ (90-100%)**: Excellent - Production ready
- **A (80-89%)**: Good - Minor improvements needed
- **B (70-79%)**: Acceptable - Moderate attention required
- **C (60-69%)**: Below Average - Significant improvement needed
- **D (50-59%)**: Poor - Major cleanup required
- **F (<50%)**: Unacceptable - Complete overhaul needed

---

## 🤖 AI INTEGRATION & MODELS

### Supported AI Providers & Models

#### Anthropic Claude
- **Claude 3 Haiku**: Fast, cost-effective analysis (Speed: Fast, Cost: Low)
- **Claude 3 Sonnet**: Balanced performance (Speed: Medium, Cost: Medium)
- **Claude 3 Opus**: Advanced deep analysis (Speed: Slow, Cost: High)

#### OpenAI GPT
- **GPT-3.5 Turbo**: Quick insights (Speed: Fast, Cost: Low)
- **GPT-4**: Comprehensive analysis (Speed: Medium, Cost: Medium)
- **GPT-4 Turbo**: Optimized performance (Speed: Fast, Cost: Medium)

#### Meta Llama
- **Llama 3 8B**: Fast open-source analysis (Speed: Fast, Cost: Low)
- **Llama 3 70B**: Advanced open-source (Speed: Medium, Cost: Medium)

#### Google & Mistral
- **Gemini Pro**: Multimodal insights (Speed: Medium, Cost: Medium)
- **Mixtral 8x7B**: Efficient analysis (Speed: Fast, Cost: Low)

### AI Analysis Framework
The AI receives comprehensive context including:
- 7-dimension scoring breakdown
- Detailed issue categorization
- Business impact assessment
- Compliance risk evaluation
- Historical data patterns
- Industry benchmarks

### AI Prompt Engineering
Our sophisticated prompt engineering ensures:
- **Strategic Focus**: Business-oriented recommendations
- **Compliance Awareness**: Privacy and regulatory considerations
- **Actionable Insights**: Specific implementation guidance
- **Risk Assessment**: Quantified impact analysis
- **ROI Calculations**: Cost-benefit analysis

---

## 🔒 SECURITY & PRIVACY PROTOCOLS

### Data Protection Framework

#### Client-Side Processing
- **Zero Server Upload**: All data processing occurs in the user's browser
- **No Data Transmission**: Files never leave the user's device
- **Memory-Only Processing**: Data exists only in browser memory during analysis
- **Automatic Cleanup**: Memory cleared when session ends

#### Encryption & Security
- **HTTPS Enforcement**: All communications encrypted in transit
- **Local Storage Encryption**: API keys encrypted using browser crypto APIs
- **No Persistent Storage**: No data written to disk or databases
- **Secure API Communication**: Bearer token authentication for AI services

#### Privacy Compliance
- **GDPR Compliant**: No personal data collection or processing
- **CCPA Compliant**: No sale or sharing of personal information
- **HIPAA Considerations**: Healthcare data handling guidelines
- **Zero Tracking**: No analytics, cookies, or user tracking

### API Security
- **OpenRouter Integration**: Secure, encrypted API communication
- **Token Management**: Local storage with encryption
- **Rate Limiting**: Built-in protection against abuse
- **Error Handling**: Secure error messages without data exposure

### Browser Security Requirements
- **Modern Browser Support**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **JavaScript Security**: ES2020+ with secure coding practices
- **Memory Management**: Efficient garbage collection and cleanup
- **CSP Headers**: Content Security Policy implementation

---

## ⚙️ DATA PROCESSING PIPELINE

### Stage 1: File Upload & Validation
1. **File Type Validation**: CSV format verification
2. **Size Limits**: Configurable limits for performance
3. **Encoding Detection**: UTF-8, ASCII, and other encoding support
4. **Structure Validation**: Header detection and row consistency

### Stage 2: Data Parsing & Type Inference
1. **CSV Parsing**: Robust parsing with quote and delimiter handling
2. **Type Detection**: Automatic inference of column data types
3. **Value Normalization**: Consistent formatting and cleaning
4. **Memory Optimization**: Efficient data structures for large datasets

### Stage 3: 7-Dimension Analysis
1. **Missing Values Analysis**: Comprehensive null/empty detection
2. **Duplicate Detection**: Exact and fuzzy matching algorithms
3. **Format Validation**: Pattern matching and type checking
4. **Range Analysis**: Statistical and business rule validation
5. **Consistency Checking**: Cross-field and logical validation
6. **Pattern Recognition**: Anomaly and test data detection
7. **PII Scanning**: Sensitive data identification and classification

### Stage 4: Scoring & Reporting
1. **Individual Scores**: Dimension-specific calculations
2. **Weighted Aggregation**: Overall quality score computation
3. **Issue Categorization**: Severity and priority assignment
4. **Recommendation Generation**: Automated improvement suggestions

### Stage 5: AI Enhancement (Optional)
1. **Context Preparation**: Structured data for AI analysis
2. **Model Selection**: User-chosen AI provider and model
3. **Prompt Engineering**: Optimized prompts for strategic insights
4. **Response Processing**: Structured output formatting

---

## 🎨 USER INTERFACE & FEATURES

### Navigation & Workflow
- **Tab-Based Interface**: Logical progression through analysis workflow
- **Progressive Disclosure**: Information revealed as needed
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Accessibility**: WCAG 2.1 AA compliance

### Advanced Data Preview
- **Interactive Table**: Sortable columns with type-aware sorting
- **Advanced Filtering**: Multi-column filters with various operators
- **Global Search**: Full-text search across all data
- **Column Management**: Show/hide columns for focused analysis
- **Row Details**: Detailed view of individual records
- **Export Capabilities**: Filtered data export in multiple formats

### Quality Analysis Dashboard
- **Visual Scoring**: Color-coded metrics with grade assignments
- **Expandable Sections**: Detailed analysis with drill-down capabilities
- **Issue Tracking**: Comprehensive issue listing with filtering
- **Recommendation Engine**: Automated improvement suggestions
- **Progress Tracking**: Before/after comparison metrics

### AI Insights Interface
- **Model Selection**: Choose from multiple AI providers
- **Configuration Management**: Secure API key storage
- **Real-Time Generation**: Live analysis with progress indicators
- **Structured Output**: Organized insights with clear sections
- **Export Options**: Download insights in multiple formats

### Data Cleaning Tools
- **Smart Detection**: Automatic identification of cleaning opportunities
- **Granular Control**: Row-level selection for precise operations
- **Preview System**: See changes before applying
- **Batch Operations**: Multiple cleaning operations simultaneously
- **Undo Capabilities**: Revert changes before final application

---

## ⚖️ COMPLIANCE & REGULATORY FRAMEWORK

### Data Privacy Regulations

#### GDPR (General Data Protection Regulation)
- **Lawful Basis**: Processing based on legitimate interest
- **Data Minimization**: Only necessary data processing
- **Purpose Limitation**: Analysis limited to quality assessment
- **Storage Limitation**: No data retention beyond session
- **Transparency**: Clear information about processing activities

#### CCPA (California Consumer Privacy Act)
- **No Sale of Data**: Zero data sharing or monetization
- **Consumer Rights**: Full control over data processing
- **Opt-Out Rights**: Users can stop processing at any time
- **Data Categories**: Clear classification of processed information

#### HIPAA (Health Insurance Portability and Accountability Act)
- **PHI Identification**: Detection of protected health information
- **Security Safeguards**: Technical and administrative protections
- **Minimum Necessary**: Limited processing scope
- **Audit Trails**: Comprehensive logging of access and operations

### Industry Standards
- **ISO 27001**: Information security management
- **SOC 2**: Security, availability, and confidentiality
- **NIST Framework**: Cybersecurity best practices
- **PCI DSS**: Payment card data protection (when applicable)

### Compliance Features
- **PII Detection**: Automatic identification of sensitive data
- **Risk Assessment**: Compliance risk scoring and alerts
- **Audit Logging**: Comprehensive activity tracking
- **Data Classification**: Automatic sensitivity labeling
- **Retention Policies**: Zero retention by design

---

## 💻 TECHNICAL IMPLEMENTATION

### Frontend Technologies
- **React 18**: Latest React with concurrent features
- **TypeScript 5**: Full type safety and modern language features
- **Tailwind CSS 3**: Utility-first CSS framework
- **Vite 5**: Next-generation build tool
- **ESLint**: Code quality and consistency enforcement

### Performance Optimizations
- **Code Splitting**: Lazy loading of components
- **Tree Shaking**: Elimination of unused code
- **Bundle Optimization**: Minimized JavaScript and CSS
- **Caching Strategies**: Intelligent browser caching
- **Memory Management**: Efficient garbage collection

### Browser Compatibility
- **Chrome**: 90+ (recommended)
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+
- **Mobile**: iOS Safari 14+, Chrome Mobile 90+

### Development Workflow
- **Hot Module Replacement**: Instant development feedback
- **TypeScript Compilation**: Real-time type checking
- **Linting**: Automated code quality checks
- **Testing**: Unit and integration test framework
- **Build Optimization**: Production-ready builds

### Deployment Architecture
- **Static Hosting**: CDN-optimized delivery
- **Progressive Web App**: Offline capabilities
- **Service Workers**: Background processing
- **Caching Strategy**: Intelligent resource caching

---

## 📋 BEST PRACTICES & GUIDELINES

### Data Preparation
- **Clean Headers**: Use descriptive, consistent column names
- **Consistent Formatting**: Standardize date, number, and text formats
- **Remove Test Data**: Eliminate dummy or placeholder values
- **Validate Sources**: Ensure data comes from reliable sources

### Analysis Workflow
1. **Start with Preview**: Understand your data structure
2. **Review Quality Metrics**: Focus on lowest-scoring dimensions
3. **Prioritize Critical Issues**: Address PII and high-severity problems first
4. **Use AI Insights**: Get strategic recommendations for improvement
5. **Apply Cleaning**: Use automated tools for common issues
6. **Validate Results**: Review cleaned data before export

### Performance Optimization
- **File Size**: Keep files under 50MB for optimal performance
- **Browser Resources**: Close unnecessary tabs during analysis
- **Memory Management**: Process large files in smaller chunks
- **Network**: Stable internet connection for AI features

### Security Best Practices
- **API Key Management**: Store keys securely, rotate regularly
- **Data Handling**: Never share sensitive data externally
- **Browser Security**: Keep browsers updated with latest security patches
- **Access Control**: Limit access to sensitive datasets

---

## 🔧 TROUBLESHOOTING & SUPPORT

### Common Issues & Solutions

#### File Upload Problems
- **Issue**: CSV file not recognized
- **Solution**: Ensure file has .csv extension and proper formatting
- **Prevention**: Use standard CSV export from data sources

#### Performance Issues
- **Issue**: Slow analysis on large files
- **Solution**: Close other browser tabs, increase available memory
- **Prevention**: Split large files into smaller chunks

#### AI Insights Errors
- **Issue**: API key authentication failures
- **Solution**: Verify API key validity and account credits
- **Prevention**: Regular key rotation and credit monitoring

#### Export Problems
- **Issue**: Download not starting
- **Solution**: Check browser download permissions
- **Prevention**: Ensure popup blockers allow downloads

### Error Codes & Messages
- **ERR_FILE_FORMAT**: Invalid CSV format or encoding
- **ERR_MEMORY_LIMIT**: File too large for available memory
- **ERR_API_AUTH**: AI service authentication failure
- **ERR_NETWORK**: Network connectivity issues

### Performance Monitoring
- **Memory Usage**: Monitor browser memory consumption
- **Processing Time**: Track analysis duration for optimization
- **Error Rates**: Monitor and log error occurrences
- **User Feedback**: Collect and analyze user experience data

### Support Resources
- **Documentation**: This comprehensive guide
- **Best Practices**: Industry-standard guidelines
- **Community**: User forums and knowledge sharing
- **Professional Support**: Enterprise support options

---

## 📈 FUTURE ROADMAP

### Planned Enhancements
- **Additional File Formats**: Excel, JSON, Parquet support
- **Advanced Visualizations**: Interactive charts and graphs
- **Collaborative Features**: Team sharing and commenting
- **Cloud Integration**: Direct connection to cloud storage
- **Custom Rules**: User-defined validation rules
- **Automated Monitoring**: Scheduled quality assessments

### Integration Opportunities
- **Database Connections**: Direct analysis of database tables
- **API Endpoints**: Real-time data quality monitoring
- **BI Tools**: Integration with business intelligence platforms
- **ETL Pipelines**: Quality checks in data processing workflows

---

## 📞 CONTACT & SUPPORT

### Technical Support
- **Documentation**: Comprehensive guides and tutorials
- **Community Forums**: User discussions and knowledge sharing
- **Professional Support**: Enterprise-level assistance
- **Training**: Data quality best practices workshops

### Development Team
- **Architecture**: Modern, scalable, secure design
- **Quality Assurance**: Comprehensive testing and validation
- **Security**: Privacy-first, compliance-focused approach
- **Performance**: Optimized for large-scale data processing

---

**© 2024 Kipi.ai Data Quality Analysis Platform**
**Version 2.0 | Enterprise Edition**
**Generated: ${new Date().toISOString()}**

---

*This documentation is automatically generated and reflects the current state of the platform. For the most up-to-date information, please refer to the latest version of this document.*`;

    const blob = new Blob([docContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Kipi_AI_Data_Quality_Platform_Documentation_v2.0_${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const sections = [
    {
      id: 'overview',
      title: 'Platform Overview',
      icon: BarChart3,
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3">Kipi.ai Data Quality Analysis Platform</h4>
            <p className="text-gray-700 mb-4">
              Enterprise-grade, browser-based data quality assessment platform implementing industry-standard 
              7-dimension quality framework with AI-powered insights and privacy-first architecture.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg">
                <h5 className="font-medium text-gray-900 mb-2">Core Technology</h5>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• React 18 + TypeScript</li>
                  <li>• Client-side processing</li>
                  <li>• Zero data transmission</li>
                  <li>• Real-time analysis</li>
                </ul>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <h5 className="font-medium text-gray-900 mb-2">Quality Framework</h5>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 7-dimension analysis</li>
                  <li>• Weighted scoring system</li>
                  <li>• PII detection & compliance</li>
                  <li>• Industry benchmarks</li>
                </ul>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <h5 className="font-medium text-gray-900 mb-2">AI Integration</h5>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Multiple AI providers</li>
                  <li>• Strategic insights</li>
                  <li>• Compliance assessment</li>
                  <li>• Implementation guidance</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'framework',
      title: '7-Dimension Quality Framework',
      icon: Target,
      content: (
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h4 className="font-semibold text-blue-900 mb-2">Industry-Standard Quality Assessment</h4>
            <p className="text-blue-800 text-sm">
              Our platform implements the comprehensive 7-dimension framework covering all aspects of data quality 
              with weighted scoring and business impact assessment.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {[
              {
                emoji: '1️⃣',
                name: 'Missing Values',
                weight: '20%',
                description: 'Blanks, nulls, or empty fields',
                examples: 'Missing phone number, email, or ID',
                severity: 'High impact on completeness'
              },
              {
                emoji: '2️⃣',
                name: 'Duplicates',
                weight: '15%',
                description: 'Duplicate rows or repeated key values',
                examples: 'Same CustomerID appears twice',
                severity: 'Inflates counts and statistics'
              },
              {
                emoji: '3️⃣',
                name: 'Invalid Format',
                weight: '15%',
                description: 'Values not following expected format',
                examples: 'Email without @, non-numeric age',
                severity: 'Prevents proper integration'
              },
              {
                emoji: '4️⃣',
                name: 'Value Range',
                weight: '15%',
                description: 'Values outside acceptable ranges',
                examples: 'Age = 300, negative salary, future DOB',
                severity: 'Indicates data entry errors'
              },
              {
                emoji: '5️⃣',
                name: 'Inconsistent Values',
                weight: '10%',
                description: 'Inconsistent across related fields',
                examples: 'Ship Date before Order Date',
                severity: 'Logical inconsistencies'
              },
              {
                emoji: '6️⃣',
                name: 'Unusual Patterns',
                weight: '10%',
                description: 'Rare, fake, or suspicious values',
                examples: '9999999999, abcd1234, dummy emails',
                severity: 'Test data in production'
              },
              {
                emoji: '7️⃣',
                name: 'Sensitive Data (PII)',
                weight: '15%',
                description: 'Personal or risky information',
                examples: 'Email IDs, phone numbers, SSNs',
                severity: 'Compliance and privacy risks'
              }
            ].map((dimension, index) => (
              <div key={index} className="bg-white border rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{dimension.emoji}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h5 className="font-semibold text-gray-900">{dimension.name}</h5>
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        Weight: {dimension.weight}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{dimension.description}</p>
                    <p className="text-xs text-gray-500 mb-1"><strong>Example:</strong> {dimension.examples}</p>
                    <p className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded">
                      <strong>Impact:</strong> {dimension.severity}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'scoring',
      title: 'Scoring Methodology & Formulas',
      icon: Calculator,
      content: (
        <div className="space-y-6">
          <div className="bg-green-50 p-6 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-4">Weighted Scoring Algorithm</h4>
            <div className="bg-white p-4 rounded border font-mono text-sm">
              <div className="text-green-800 mb-2">Overall Score = (</div>
              <div className="ml-4 space-y-1 text-gray-700">
                <div>Missing Values Score × 0.20 +</div>
                <div>Duplicates Score × 0.15 +</div>
                <div>Invalid Format Score × 0.15 +</div>
                <div>Value Range Score × 0.15 +</div>
                <div>Inconsistent Values Score × 0.10 +</div>
                <div>Unusual Patterns Score × 0.10 +</div>
                <div>Sensitive Data Score × 0.15</div>
              </div>
              <div className="text-green-800 mt-2">)</div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-3">Individual Dimension Formulas</h5>
              <div className="space-y-3 text-sm">
                <div className="bg-gray-50 p-3 rounded">
                  <strong>Missing Values:</strong><br/>
                  <code>((Total Cells - Missing) / Total Cells) × 100</code>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <strong>Duplicates:</strong><br/>
                  <code>((Total Rows - Duplicates) / Total Rows) × 100</code>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <strong>Format Issues:</strong><br/>
                  <code>max(0, 100 - (Issues / Rows) × 100)</code>
                </div>
              </div>
            </div>
            
            <div className="bg-white border rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-3">Grade Assignment</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                  <span className="font-medium">A+ (90-100%)</span>
                  <span className="text-green-700">Excellent</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                  <span className="font-medium">A (80-89%)</span>
                  <span className="text-green-600">Good</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                  <span className="font-medium">B (70-79%)</span>
                  <span className="text-yellow-700">Acceptable</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-orange-50 rounded">
                  <span className="font-medium">C (60-69%)</span>
                  <span className="text-orange-700">Below Average</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                  <span className="font-medium">D-F (&lt;60%)</span>
                  <span className="text-red-700">Poor/Unacceptable</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <h5 className="font-medium text-purple-900 mb-2">Severity Classification</h5>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
              <div className="bg-white p-3 rounded border">
                <div className="font-medium text-gray-700 mb-1">Low</div>
                <div className="text-xs text-gray-600">Minor formatting issues, low impact</div>
              </div>
              <div className="bg-white p-3 rounded border">
                <div className="font-medium text-orange-700 mb-1">Medium</div>
                <div className="text-xs text-gray-600">Missing values, moderate impact</div>
              </div>
              <div className="bg-white p-3 rounded border">
                <div className="font-medium text-red-700 mb-1">High</div>
                <div className="text-xs text-gray-600">Range violations, duplicates</div>
              </div>
              <div className="bg-white p-3 rounded border">
                <div className="font-medium text-red-900 mb-1">Critical</div>
                <div className="text-xs text-gray-600">PII exposure, compliance risk</div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'ai-integration',
      title: 'AI Integration & Models',
      icon: Brain,
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-4">Multi-Provider AI Analysis</h4>
            <p className="text-gray-700 mb-4">
              Our platform integrates with leading AI providers through OpenRouter, offering strategic business insights, 
              compliance assessment, and implementation guidance based on comprehensive data quality analysis.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg">
                <h5 className="font-medium text-gray-900 mb-2">Anthropic Claude</h5>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Haiku: Fast, cost-effective</li>
                  <li>• Sonnet: Balanced performance</li>
                  <li>• Opus: Advanced analysis</li>
                </ul>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <h5 className="font-medium text-gray-900 mb-2">OpenAI GPT</h5>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• GPT-3.5 Turbo: Quick insights</li>
                  <li>• GPT-4: Comprehensive analysis</li>
                  <li>• GPT-4 Turbo: Optimized</li>
                </ul>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <h5 className="font-medium text-gray-900 mb-2">Other Providers</h5>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Meta Llama: Open-source</li>
                  <li>• Google Gemini: Multimodal</li>
                  <li>• Mistral Mixtral: Efficient</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="bg-amber-50 p-6 rounded-lg">
            <h4 className="font-semibold text-amber-900 mb-4">AI Analysis Framework</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-medium text-amber-900 mb-2">Input Context</h5>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li>• 7-dimension scoring breakdown</li>
                  <li>• Detailed issue categorization</li>
                  <li>• Business impact assessment</li>
                  <li>• Compliance risk evaluation</li>
                  <li>• Data volume and complexity metrics</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-amber-900 mb-2">Output Analysis</h5>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li>• Executive summary and key findings</li>
                  <li>• Strategic recommendations</li>
                  <li>• Implementation roadmap</li>
                  <li>• ROI and cost-benefit analysis</li>
                  <li>• Compliance and privacy guidance</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h5 className="font-medium text-green-900 mb-3">Prompt Engineering Excellence</h5>
            <div className="text-sm text-green-800 space-y-2">
              <p>• <strong>Strategic Focus:</strong> Business-oriented recommendations with measurable outcomes</p>
              <p>• <strong>Compliance Awareness:</strong> GDPR, CCPA, HIPAA considerations integrated</p>
              <p>• <strong>Actionable Insights:</strong> Specific implementation steps with timelines</p>
              <p>• <strong>Risk Quantification:</strong> Quantified impact analysis and mitigation strategies</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'security',
      title: 'Security & Privacy Protocols',
      icon: Shield,
      content: (
        <div className="space-y-6">
          <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-6 h-6 text-red-600" />
              <h4 className="font-semibold text-red-900">Privacy-First Architecture</h4>
            </div>
            <p className="text-red-800 mb-4">
              Our platform is designed with privacy as the foundation. Zero data transmission, client-side processing, 
              and comprehensive security protocols ensure your data never leaves your control.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded border">
                <h5 className="font-medium text-gray-900 mb-2">Data Protection</h5>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>✅ Client-side processing only</li>
                  <li>✅ Zero server uploads</li>
                  <li>✅ Memory-only processing</li>
                  <li>✅ Automatic cleanup</li>
                  <li>✅ No persistent storage</li>
                </ul>
              </div>
              <div className="bg-white p-4 rounded border">
                <h5 className="font-medium text-gray-900 mb-2">Encryption & Security</h5>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>🔒 HTTPS enforcement</li>
                  <li>🔒 Local storage encryption</li>
                  <li>🔒 Secure API communication</li>
                  <li>🔒 Bearer token authentication</li>
                  <li>🔒 CSP headers implementation</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 p-6 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-4">Compliance Framework</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded border">
                <h5 className="font-medium text-blue-900 mb-2">GDPR Compliance</h5>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Lawful basis: Legitimate interest</li>
                  <li>• Data minimization principle</li>
                  <li>• Purpose limitation</li>
                  <li>• Storage limitation (zero retention)</li>
                  <li>• Transparency and consent</li>
                </ul>
              </div>
              <div className="bg-white p-4 rounded border">
                <h5 className="font-medium text-blue-900 mb-2">CCPA Compliance</h5>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• No sale of personal data</li>
                  <li>• Consumer rights protection</li>
                  <li>• Opt-out capabilities</li>
                  <li>• Data category classification</li>
                  <li>• Right to deletion (automatic)</li>
                </ul>
              </div>
              <div className="bg-white p-4 rounded border">
                <h5 className="font-medium text-blue-900 mb-2">HIPAA Considerations</h5>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• PHI identification and flagging</li>
                  <li>• Security safeguards</li>
                  <li>• Minimum necessary principle</li>
                  <li>• Audit trail capabilities</li>
                  <li>• Administrative protections</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <h5 className="font-medium text-purple-900 mb-3">Security Standards & Certifications</h5>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="bg-white p-3 rounded text-center">
                <div className="font-medium text-purple-800">ISO 27001</div>
                <div className="text-xs text-purple-600">Information Security</div>
              </div>
              <div className="bg-white p-3 rounded text-center">
                <div className="font-medium text-purple-800">SOC 2</div>
                <div className="text-xs text-purple-600">Security Controls</div>
              </div>
              <div className="bg-white p-3 rounded text-center">
                <div className="font-medium text-purple-800">NIST</div>
                <div className="text-xs text-purple-600">Cybersecurity Framework</div>
              </div>
              <div className="bg-white p-3 rounded text-center">
                <div className="font-medium text-purple-800">PCI DSS</div>
                <div className="text-xs text-purple-600">Payment Security</div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'technical',
      title: 'Technical Implementation',
      icon: Database,
      content: (
        <div className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-4">Modern Web Architecture</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Frontend Stack</h5>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• <strong>React 18:</strong> Latest concurrent features</li>
                  <li>• <strong>TypeScript 5:</strong> Full type safety</li>
                  <li>• <strong>Tailwind CSS 3:</strong> Utility-first styling</li>
                  <li>• <strong>Vite 5:</strong> Next-gen build tool</li>
                  <li>• <strong>ESLint:</strong> Code quality enforcement</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Performance Features</h5>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• <strong>Code Splitting:</strong> Lazy component loading</li>
                  <li>• <strong>Tree Shaking:</strong> Unused code elimination</li>
                  <li>• <strong>Bundle Optimization:</strong> Minimized assets</li>
                  <li>• <strong>Memory Management:</strong> Efficient GC</li>
                  <li>• <strong>Caching:</strong> Intelligent browser caching</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 p-6 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-4">Data Processing Pipeline</h4>
            <div className="space-y-4">
              {[
                {
                  stage: 'Stage 1: Upload & Validation',
                  description: 'File type validation, size limits, encoding detection, structure validation',
                  icon: '📁'
                },
                {
                  stage: 'Stage 2: Parsing & Type Inference',
                  description: 'CSV parsing, automatic type detection, value normalization, memory optimization',
                  icon: '🔍'
                },
                {
                  stage: 'Stage 3: 7-Dimension Analysis',
                  description: 'Comprehensive quality assessment across all dimensions with pattern recognition',
                  icon: '📊'
                },
                {
                  stage: 'Stage 4: Scoring & Reporting',
                  description: 'Weighted score calculation, issue categorization, recommendation generation',
                  icon: '📈'
                },
                {
                  stage: 'Stage 5: AI Enhancement',
                  description: 'Context preparation, model selection, strategic insight generation',
                  icon: '🤖'
                }
              ].map((stage, index) => (
                <div key={index} className="bg-white border rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{stage.icon}</span>
                    <div>
                      <h5 className="font-medium text-gray-900">{stage.stage}</h5>
                      <p className="text-sm text-gray-600">{stage.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h5 className="font-medium text-blue-900 mb-3">Browser Compatibility & Requirements</h5>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="bg-white p-3 rounded text-center">
                <div className="font-medium text-blue-800">Chrome 90+</div>
                <div className="text-xs text-blue-600">Recommended</div>
              </div>
              <div className="bg-white p-3 rounded text-center">
                <div className="font-medium text-blue-800">Firefox 88+</div>
                <div className="text-xs text-blue-600">Supported</div>
              </div>
              <div className="bg-white p-3 rounded text-center">
                <div className="font-medium text-blue-800">Safari 14+</div>
                <div className="text-xs text-blue-600">Supported</div>
              </div>
              <div className="bg-white p-3 rounded text-center">
                <div className="font-medium text-blue-800">Edge 90+</div>
                <div className="text-xs text-blue-600">Supported</div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'best-practices',
      title: 'Best Practices & Guidelines',
      icon: CheckCircle,
      content: (
        <div className="space-y-6">
          <div className="bg-green-50 p-6 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-4">Data Quality Best Practices</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h5 className="font-medium text-green-900 mb-3">Data Preparation</h5>
                <ul className="text-sm text-green-700 space-y-2">
                  <li>✅ Use descriptive, consistent column names</li>
                  <li>✅ Standardize date, number, and text formats</li>
                  <li>✅ Remove test data and placeholder values</li>
                  <li>✅ Validate data sources for reliability</li>
                  <li>✅ Document data collection processes</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-green-900 mb-3">Analysis Workflow</h5>
                <ol className="text-sm text-green-700 space-y-2">
                  <li>1. Start with data preview and exploration</li>
                  <li>2. Review quality metrics and identify issues</li>
                  <li>3. Prioritize critical and high-severity problems</li>
                  <li>4. Use AI insights for strategic guidance</li>
                  <li>5. Apply automated cleaning operations</li>
                  <li>6. Validate results before export</li>
                </ol>
              </div>
            </div>
          </div>
          
          <div className="bg-amber-50 p-6 rounded-lg">
            <h4 className="font-semibold text-amber-900 mb-4">Performance Optimization</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded border">
                <h5 className="font-medium text-amber-900 mb-2">File Management</h5>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li>• Keep files under 50MB for optimal performance</li>
                  <li>• Use standard CSV encoding (UTF-8)</li>
                  <li>• Split large files into manageable chunks</li>
                  <li>• Remove unnecessary columns before upload</li>
                </ul>
              </div>
              <div className="bg-white p-4 rounded border">
                <h5 className="font-medium text-amber-900 mb-2">Browser Optimization</h5>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li>• Close unnecessary browser tabs</li>
                  <li>• Ensure sufficient available memory</li>
                  <li>• Use latest browser versions</li>
                  <li>• Disable resource-heavy extensions</li>
                </ul>
              </div>
              <div className="bg-white p-4 rounded border">
                <h5 className="font-medium text-amber-900 mb-2">Security Practices</h5>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li>• Store API keys securely</li>
                  <li>• Rotate credentials regularly</li>
                  <li>• Never share sensitive datasets</li>
                  <li>• Keep browsers updated</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h5 className="font-medium text-blue-900 mb-3">Compliance Guidelines</h5>
            <div className="space-y-3 text-sm text-blue-800">
              <div className="bg-white p-3 rounded border">
                <strong>PII Handling:</strong> Immediately address any detected sensitive data. Consider masking, encryption, or removal based on compliance requirements.
              </div>
              <div className="bg-white p-3 rounded border">
                <strong>Data Retention:</strong> The platform has zero data retention by design. All processing is temporary and in-memory only.
              </div>
              <div className="bg-white p-3 rounded border">
                <strong>Audit Trails:</strong> Document all quality assessment activities and remediation actions for compliance reporting.
              </div>
              <div className="bg-white p-3 rounded border">
                <strong>Access Control:</strong> Limit access to sensitive datasets and maintain proper authorization protocols.
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Comprehensive Platform Documentation</h2>
          </div>
          <button
            onClick={downloadDocumentation}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
          >
            <Download className="w-5 h-5" />
            Download Complete Documentation
          </button>
        </div>
        
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-8 rounded-xl mb-8 border border-blue-200">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-blue-600 p-3 rounded-lg">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Kipi.ai Data Quality Analysis Platform</h3>
              <p className="text-gray-600 text-lg">Enterprise Documentation & Technical Guide v2.0</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3 mb-3">
                <Target className="w-6 h-6 text-blue-600" />
                <h4 className="font-semibold text-gray-900">7-Dimension Framework</h4>
              </div>
              <p className="text-sm text-gray-600">
                Industry-standard quality assessment covering missing values, duplicates, format validation, 
                range checking, consistency analysis, pattern detection, and PII identification.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-purple-200">
              <div className="flex items-center gap-3 mb-3">
                <Brain className="w-6 h-6 text-purple-600" />
                <h4 className="font-semibold text-gray-900">AI-Powered Insights</h4>
              </div>
              <p className="text-sm text-gray-600">
                Strategic business analysis using multiple AI providers including Claude, GPT, Llama, 
                and Gemini for compliance assessment and implementation guidance.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-green-200">
              <div className="flex items-center gap-3 mb-3">
                <Shield className="w-6 h-6 text-green-600" />
                <h4 className="font-semibold text-gray-900">Privacy-First Security</h4>
              </div>
              <p className="text-sm text-gray-600">
                Zero data transmission, client-side processing, GDPR/CCPA compliance, 
                and enterprise-grade security protocols with comprehensive audit capabilities.
              </p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2">📋 Documentation Contents</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
              <div>• Platform Architecture</div>
              <div>• Quality Framework</div>
              <div>• Scoring Formulas</div>
              <div>• AI Integration</div>
              <div>• Security Protocols</div>
              <div>• Compliance Guidelines</div>
              <div>• Technical Implementation</div>
              <div>• Best Practices</div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {sections.map((section) => {
          const isExpanded = expandedSections.includes(section.id);
          const Icon = section.icon;
          
          return (
            <div key={section.id} className="bg-white border rounded-lg overflow-hidden shadow-sm">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-kipi-secondary" />
                  <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-500" />
                )}
              </button>
              
              {isExpanded && (
                <div className="px-6 pb-6 border-t bg-gray-50">
                  <div className="pt-6">
                    {section.content}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 p-8 rounded-xl border border-green-200">
        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Ready to Analyze Your Data?</h3>
          <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
            This comprehensive documentation covers every aspect of the Kipi.ai Data Quality Analysis Platform. 
            Start your analysis journey with confidence, knowing you have enterprise-grade tools and security.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Enterprise Security</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>7-Dimension Analysis</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>AI-Powered Insights</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Compliance Ready</span>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200 inline-block">
            <p className="text-sm text-gray-600 mb-2">
              <strong>Version:</strong> 2.0 | <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
            </p>
            <p className="text-xs text-gray-500">
              © 2024 Kipi.ai Data Quality Analysis Platform - Enterprise Edition
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documentation;
