'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CloudArrowUpIcon,
  DocumentIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  ChartBarIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface FileUploadProps {
  onFileUpload: (data: any[]) => void;
  uploadedData: any[] | null;
  loading: boolean;
  onGeneratePrediction: () => void;
}

interface UploadProgress {
  progress: number;
  status: 'uploading' | 'processing' | 'complete' | 'error';
  fileName?: string;
}

export default function EnhancedFileUpload({ 
  onFileUpload, 
  uploadedData, 
  loading, 
  onGeneratePrediction 
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (isValidFile(file)) {
        setSelectedFile(file);
        processFile(file);
      } else {
        toast.error('Please upload a valid Excel (.xlsx, .xls) or CSV file');
      }
    }
  }, []);

  const isValidFile = (file: File): boolean => {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv' // .csv
    ];
    return validTypes.includes(file.type) || file.name.endsWith('.csv');
  };

  const processFile = async (file: File) => {
    setUploadProgress({ progress: 0, status: 'uploading', fileName: file.name });
    
    const reader = new FileReader();
    
    reader.onprogress = (e) => {
      if (e.lengthComputable) {
        const progress = (e.loaded / e.total) * 50; // First 50% for reading
        setUploadProgress(prev => prev ? { ...prev, progress } : null);
      }
    };

    reader.onload = async (e) => {
      try {
        setUploadProgress(prev => prev ? { ...prev, progress: 60, status: 'processing' } : null);
        
        // Simulate processing time for better UX
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        
        let jsonData: any[] = [];
        
        if (file.type.includes('csv') || file.name.endsWith('.csv')) {
          // Handle CSV files
          const text = new TextDecoder().decode(data);
          console.log('CSV file content length:', text.length);
          jsonData = parseCSV(text);
        } else {
          // Handle Excel files
          const XLSX = await import('xlsx');
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          console.log('Excel sheet name:', sheetName);
          console.log('Excel sheet range:', worksheet['!ref']);
          
          jsonData = XLSX.utils.sheet_to_json(worksheet);
          console.log('Excel processed rows:', jsonData.length);
        }
        
        setUploadProgress(prev => prev ? { ...prev, progress: 90 } : null);
        
        // Final processing
        await new Promise(resolve => setTimeout(resolve, 300));
        
        setUploadProgress({ progress: 100, status: 'complete', fileName: file.name });
        onFileUpload(jsonData);
        
        console.log('Final upload data:', jsonData);
        toast.success(`Successfully uploaded ${jsonData.length} patient records from ${file.name}`);
        
        // Show detailed info if there's a discrepancy
        if (file.name.endsWith('.csv')) {
          const totalLines = new TextDecoder().decode(data).split('\n').length;
          if (jsonData.length !== totalLines - 1) { // -1 for header
            toast.success(`Note: Processed ${jsonData.length} valid records out of ${totalLines - 1} total data rows (excluding header)`, { duration: 4000 });
          }
        }
        
        // Clear progress after delay
        setTimeout(() => setUploadProgress(null), 2000);
        
      } catch (error) {
        console.error('File processing error:', error);
        setUploadProgress(prev => prev ? { ...prev, status: 'error' } : null);
        toast.error('Error processing file. Please ensure it\'s a valid Excel/CSV file.');
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const parseCSV = (text: string): any[] => {
    const lines = text.split('\n');
    console.log('Total lines in CSV:', lines.length);
    
    // Filter out completely empty lines but keep lines with some content
    const nonEmptyLines = lines.filter(line => line.trim().length > 0);
    console.log('Non-empty lines:', nonEmptyLines.length);
    
    if (nonEmptyLines.length === 0) return [];
    
    const headers = nonEmptyLines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    console.log('Headers found:', headers);
    
    const data = [];
    
    // Process all data rows (skip header row)
    for (let i = 1; i < nonEmptyLines.length; i++) {
      const line = nonEmptyLines[i].trim();
      
      // Skip lines that are just commas or very short
      if (line.length < 3) {
        console.log(`Skipping short line ${i + 1}: "${line}"`);
        continue;
      }
      
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      
      // Only skip if ALL values are empty
      const hasValidData = values.some(v => v && v.length > 0);
      if (!hasValidData) {
        console.log(`Skipping empty data row ${i + 1}`);
        continue;
      }
      
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      
      data.push(row);
    }
    
    console.log('Final processed data rows:', data.length);
    return data;
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (isValidFile(file)) {
        setSelectedFile(file);
        processFile(file);
      } else {
        toast.error('Please upload a valid Excel (.xlsx, .xls) or CSV file');
      }
    }
  };

  return (
    <div className="bg-gradient-to-br from-white via-red-50/30 to-red-100/20 backdrop-blur-sm border border-red-200/50 rounded-2xl p-8 shadow-xl">
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full mb-4 shadow-lg"
        >
          <CloudArrowUpIcon className="h-8 w-8 text-white" />
        </motion.div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Upload Patient Data</h3>
        <p className="text-gray-600">Upload Excel or CSV files to generate AI-powered predictions</p>
      </div>

      {/* Upload Area */}
      <motion.div
        className={`
          relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300
          ${isDragOver 
            ? 'border-red-400 bg-red-50/50 scale-105' 
            : 'border-gray-300 hover:border-red-400 hover:bg-red-50/30'
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {/* Upload Progress */}
        <AnimatePresence>
          {uploadProgress && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm rounded-2xl"
            >
              <div className="text-center space-y-4">
                {uploadProgress.status === 'complete' ? (
                  <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto animate-bounce" />
                ) : uploadProgress.status === 'error' ? (
                  <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto" />
                ) : (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <ArrowPathIcon className="h-12 w-12 text-red-500 mx-auto" />
                  </motion.div>
                )}
                
                <div className="space-y-2">
                  <p className="font-semibold text-gray-900">
                    {uploadProgress.status === 'uploading' && 'Uploading file...'}
                    {uploadProgress.status === 'processing' && 'Processing data...'}
                    {uploadProgress.status === 'complete' && 'Upload complete!'}
                    {uploadProgress.status === 'error' && 'Upload failed'}
                  </p>
                  <p className="text-sm text-gray-600">{uploadProgress.fileName}</p>
                  
                  {/* Progress Bar */}
                  <div className="w-64 h-2 bg-gray-200 rounded-full mx-auto">
                    <motion.div
                      className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress.progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">{Math.round(uploadProgress.progress)}%</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Default Upload UI */}
        {!uploadProgress && (
          <div className="space-y-6">
            <motion.div
              animate={isDragOver ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <DocumentIcon className="h-16 w-16 text-red-400 mx-auto mb-4" />
            </motion.div>
            
            <div className="space-y-4">
              <p className="text-lg font-semibold text-gray-900">
                {isDragOver ? 'Drop your file here!' : 'Drag & drop your file here'}
              </p>
              <p className="text-gray-500">or</p>
              
              <motion.button
                onClick={handleFileSelect}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl shadow-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <CloudArrowUpIcon className="h-5 w-5 mr-2" />
                Choose File
              </motion.button>
            </div>
            
            <div className="text-sm text-gray-500 space-y-1">
              <p>Supported formats: Excel (.xlsx, .xls), CSV</p>
              <p>Maximum file size: 10MB</p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Upload Success */}
      <AnimatePresence>
        {uploadedData && !uploadProgress && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6"
          >
            <div className="flex items-center space-x-4">
              <CheckCircleIcon className="h-8 w-8 text-green-500 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-semibold text-green-800">File uploaded successfully!</h4>
                <p className="text-green-700">
                  <span className="font-medium">{uploadedData.length}</span> patient records ready for AI analysis
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generate Prediction Button */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <motion.button
          onClick={onGeneratePrediction}
          disabled={loading || !uploadedData}
          className={`
            w-full flex items-center justify-center px-8 py-4 font-semibold rounded-xl transition-all duration-200 transform
            ${loading || !uploadedData
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg hover:from-red-600 hover:to-red-700 hover:scale-105 hover:shadow-xl'
            }
          `}
          whileHover={!loading && uploadedData ? { scale: 1.02 } : {}}
          whileTap={!loading && uploadedData ? { scale: 0.98 } : {}}
        >
          {loading ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="mr-3"
              >
                <ArrowPathIcon className="h-5 w-5" />
              </motion.div>
              Generating AI Prediction...
            </>
          ) : (
            <>
              <SparklesIcon className="h-5 w-5 mr-3" />
              Generate AI Prediction
            </>
          )}
        </motion.button>
        
        {!uploadedData && (
          <p className="text-center text-sm text-gray-500 mt-2">
            Upload patient data first to enable AI predictions
          </p>
        )}
      </div>
    </div>
  );
}
