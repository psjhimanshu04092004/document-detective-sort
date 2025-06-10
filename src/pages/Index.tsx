
import React, { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { DocumentProcessor } from '@/components/DocumentProcessor';
import { ResultsPanel } from '@/components/ResultsPanel';
import { Header } from '@/components/Header';
import { useToast } from '@/hooks/use-toast';

export interface ProcessedDocument {
  id: string;
  file: File;
  originalName: string;
  category: string;
  confidence: number;
  ocrText: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
}

const Index = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [processedDocuments, setProcessedDocuments] = useState<ProcessedDocument[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
    toast({
      title: "Files uploaded successfully",
      description: `${selectedFiles.length} files ready for processing`,
    });
  };

  const handleProcessingComplete = (documents: ProcessedDocument[]) => {
    setProcessedDocuments(documents);
    setIsProcessing(false);
    toast({
      title: "Processing complete!",
      description: `Successfully processed ${documents.length} documents`,
    });
  };

  const handleStartProcessing = () => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please upload some documents first",
        variant: "destructive",
      });
      return;
    }
    setIsProcessing(true);
  };

  const handleReset = () => {
    setFiles([]);
    setProcessedDocuments([]);
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Document Detective
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Automatically sort and organize your documents using AI-powered OCR. 
              Upload PDFs and images to get started.
            </p>
          </div>

          <div className="grid gap-8">
            {!isProcessing && processedDocuments.length === 0 && (
              <FileUpload 
                onFilesSelected={handleFilesSelected}
                selectedFiles={files}
                onStartProcessing={handleStartProcessing}
                onReset={handleReset}
              />
            )}

            {isProcessing && (
              <DocumentProcessor
                files={files}
                onProcessingComplete={handleProcessingComplete}
              />
            )}

            {processedDocuments.length > 0 && !isProcessing && (
              <ResultsPanel
                documents={processedDocuments}
                onReset={handleReset}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
