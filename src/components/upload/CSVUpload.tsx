import { useState, useCallback } from 'react';
import { Upload, AlertCircle, CheckCircle, FileText } from 'lucide-react';
import { parseCSV, validateCSVStructure } from '../../utils/csvParser';
import { Transaction } from '../../types';

interface Props {
  onTransactionsLoaded: (transactions: Transaction[]) => void;
}

export function CSVUpload({ onTransactionsLoaded }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<{
    headers: string[];
    validation: string;
    rowCount: number;
  } | null>(null);

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    setPreview(null);
    setIsProcessing(true);

    try {
      if (!file.name.endsWith('.csv')) {
        throw new Error('Please upload a CSV file');
      }

      const result = await parseCSV(file);

      if (result.errors.length > 0) {
        setError(`Found ${result.errors.length} error(s):\n${result.errors.slice(0, 3).join('\n')}`);
      }

      if (result.transactions.length === 0) {
        throw new Error('No valid transactions found in CSV file');
      }

      const validation = validateCSVStructure(result.headers);
      setPreview({
        headers: result.headers,
        validation: validation.message,
        rowCount: result.rowCount,
      });

      onTransactionsLoaded(result.transactions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process CSV file');
    } finally {
      setIsProcessing(false);
    }
  }, [onTransactionsLoaded]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={`
          relative border-2 border-dashed rounded-xl p-12 transition-all duration-300
          ${isDragging
            ? 'border-primary-400 bg-primary-500/10 scale-105'
            : 'border-gray-600 hover:border-gray-500'
          }
          ${isProcessing ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          accept=".csv"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isProcessing}
        />

        <div className="flex flex-col items-center text-center">
          <div className={`
            p-4 rounded-full mb-4 transition-colors
            ${isDragging ? 'bg-primary-500/20' : 'bg-gray-700/50'}
          `}>
            {isProcessing ? (
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
            ) : (
              <Upload className={`h-12 w-12 ${isDragging ? 'text-primary-400' : 'text-gray-400'}`} />
            )}
          </div>

          <h3 className="text-xl font-semibold text-gray-200 mb-2">
            {isProcessing ? 'Processing CSV...' : 'Upload Your Bank Statement'}
          </h3>

          <p className="text-gray-400 mb-4">
            Drag and drop your CSV file here, or click to browse
          </p>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <FileText className="h-4 w-4" />
            <span>Supports most bank CSV formats</span>
          </div>
        </div>
      </div>

      {preview && (
        <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg animate-slide-up">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-green-400 font-medium mb-1">CSV Loaded Successfully</h4>
              <p className="text-sm text-gray-300 mb-2">{preview.validation}</p>
              <p className="text-sm text-gray-400">
                Processed {preview.rowCount} rows • Found {preview.headers.length} columns
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg animate-slide-up">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-red-400 font-medium mb-1">Error Processing CSV</h4>
              <p className="text-sm text-gray-300 whitespace-pre-line">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <h4 className="text-blue-400 font-medium mb-2 flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          Privacy First
        </h4>
        <p className="text-sm text-gray-300">
          Your data is processed entirely in your browser. Nothing is uploaded to any server.
          All data stays on your device.
        </p>
      </div>
    </div>
  );
}
