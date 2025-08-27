'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CloudArrowUpIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  ArrowPathIcon,
  PhotoIcon,
  DocumentIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface VitalsFileUploadProps {
  onFileUpload?: (file: File, data: any) => void;
  acceptedTypes?: string;
  maxSize?: number; // in MB
  title?: string;
  description?: string;
}

interface UploadProgress {
  progress: number;
  status: 'uploading' | 'processing' | 'complete' | 'error';
  fileName?: string;
}

export default function EnhancedVitalsUpload({ 
  onFileUpload,
  acceptedTypes = '.xlsx,.xls,.csv,.pdf,.jpg,.jpeg,.png',
  maxSize = 10,
  title = 'Upload Patient Files',
  description = 'Upload vital signs, medical records, or diagnostic images'
}: VitalsFileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

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
    
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  }, []);

  const isValidFile = (file: File): boolean => {
    const validExtensions = acceptedTypes.split(',').map(ext => ext.trim());
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const isValidType = validExtensions.some(ext => 
      ext === fileExtension || file.type.includes(ext.replace('.', ''))
    );
    const isValidSize = file.size <= maxSize * 1024 * 1024;
    
    if (!isValidType) {
      toast.error(`File type not supported. Accepted types: ${acceptedTypes}`);
      return false;
    }
    
    if (!isValidSize) {
      toast.error(`File too large. Maximum size: ${maxSize}MB`);
      return false;
    }
    
    return true;
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'xlsx':
      case 'xls':
      case 'csv':
        return DocumentTextIcon;
      case 'pdf':
        return DocumentIcon;
      case 'jpg':
      case 'jpeg':
      case 'png':
        return PhotoIcon;
      default:
        return DocumentIcon;
    }
  };

  const getFileColor = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'xlsx':
      case 'xls':
      case 'csv':
        return 'text-green-500';
      case 'pdf':
        return 'text-red-500';
      case 'jpg':
      case 'jpeg':
      case 'png':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  const processFiles = async (files: File[]) => {
    const validFiles = files.filter(isValidFile);
    if (validFiles.length === 0) return;

    for (const file of validFiles) {
      setUploadProgress({ progress: 0, status: 'uploading', fileName: file.name });
      
      try {
        // Simulate upload progress
        for (let progress = 0; progress <= 90; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, 100));
          setUploadProgress(prev => prev ? { ...prev, progress } : null);
        }
        
        setUploadProgress(prev => prev ? { ...prev, status: 'processing' } : null);
        
        // Process file based on type
        let processedData = null;
        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        
        if (['xlsx', 'xls', 'csv'].includes(fileExtension || '')) {
          // Handle spreadsheet files
          const arrayBuffer = await file.arrayBuffer();
          
          if (fileExtension === 'csv') {
            const text = new TextDecoder().decode(arrayBuffer);
            processedData = parseCSV(text);
          } else {
            const XLSX = await import('xlsx');
            const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            processedData = XLSX.utils.sheet_to_json(worksheet);
          }
        } else if (fileExtension === 'pdf') {
          // For PDF files, we'll just store the file reference
          processedData = { type: 'pdf', name: file.name, size: file.size };
        } else if (['jpg', 'jpeg', 'png'].includes(fileExtension || '')) {
          // For image files, we'll create a preview URL
          processedData = { 
            type: 'image', 
            name: file.name, 
            size: file.size,
            url: URL.createObjectURL(file)
          };
        }
        
        setUploadProgress({ progress: 100, status: 'complete', fileName: file.name });
        
        // Add to uploaded files
        setUploadedFiles(prev => [...prev, file]);
        
        // Call the callback with file and processed data
        if (onFileUpload) {
          onFileUpload(file, processedData);
        }
        
        toast.success(`Successfully uploaded ${file.name}`);
        
        // Clear progress after delay
        setTimeout(() => setUploadProgress(null), 2000);
        
      } catch (error) {
        console.error('File processing error:', error);
        setUploadProgress(prev => prev ? { ...prev, status: 'error' } : null);
        toast.error(`Error processing ${file.name}`);
      }
    }
  };

  const parseCSV = (text: string): any[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      data.push(row);
    }
    
    return data;
  };

  const handleFileSelect = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = acceptedTypes;
    input.multiple = true;
    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      processFiles(files);
    };
    input.click();
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-gradient-to-br from-white via-blue-50/30 to-blue-100/20 backdrop-blur-sm border border-blue-200/50 rounded-2xl p-8 shadow-xl">
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mb-4 shadow-lg"
        >
          <CloudArrowUpIcon className="h-8 w-8 text-white" />
        </motion.div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>

      {/* Upload Area */}
      <motion.div
        className={`
          relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300
          ${isDragOver 
            ? 'border-blue-400 bg-blue-50/50 scale-105' 
            : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/30'
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
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
                    <ArrowPathIcon className="h-12 w-12 text-blue-500 mx-auto" />
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
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
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
              <CloudArrowUpIcon className="h-16 w-16 text-blue-400 mx-auto mb-4" />
            </motion.div>
            
            <div className="space-y-4">
              <p className="text-lg font-semibold text-gray-900">
                {isDragOver ? 'Drop your files here!' : 'Drag & drop files here'}
              </p>
              <p className="text-gray-500">or</p>
              
              <motion.button
                onClick={handleFileSelect}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <CloudArrowUpIcon className="h-5 w-5 mr-2" />
                Choose Files
              </motion.button>
            </div>
            
            <div className="text-sm text-gray-500 space-y-1">
              <p>Supported formats: {acceptedTypes}</p>
              <p>Maximum file size: {maxSize}MB per file</p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Uploaded Files List */}
      <AnimatePresence>
        {uploadedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-6"
          >
            <h4 className="font-semibold text-gray-900 mb-4">Uploaded Files ({uploadedFiles.length})</h4>
            <div className="space-y-3">
              {uploadedFiles.map((file, index) => {
                const FileIcon = getFileIcon(file.name);
                const colorClass = getFileColor(file.name);
                
                return (
                  <motion.div
                    key={`${file.name}-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl"
                  >
                    <div className="flex items-center space-x-3">
                      <FileIcon className={`h-8 w-8 ${colorClass}`} />
                      <div>
                        <p className="font-medium text-gray-900">{file.name}</p>
                        <p className="text-sm text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
