
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ProcessedDocument } from '@/pages/Index';
import { processDocument } from '@/utils/ocrUtils';
import { FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface DocumentProcessorProps {
  files: File[];
  onProcessingComplete: (documents: ProcessedDocument[]) => void;
}

export const DocumentProcessor: React.FC<DocumentProcessorProps> = ({
  files,
  onProcessingComplete,
}) => {
  const [processedDocs, setProcessedDocs] = useState<ProcessedDocument[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const processFiles = async () => {
      const documents: ProcessedDocument[] = files.map((file, index) => ({
        id: `doc_${index}`,
        file,
        originalName: file.name,
        category: 'Unclassified',
        confidence: 0,
        ocrText: '',
        status: 'pending' as const,
      }));

      setProcessedDocs(documents);

      for (let i = 0; i < files.length; i++) {
        setCurrentIndex(i);
        const updatedDocs = [...documents];
        updatedDocs[i].status = 'processing';
        setProcessedDocs([...updatedDocs]);

        try {
          const result = await processDocument(files[i]);
          updatedDocs[i] = {
            ...updatedDocs[i],
            category: result.category,
            confidence: result.confidence,
            ocrText: result.ocrText,
            status: 'completed',
          };
        } catch (error) {
          console.error(`Error processing ${files[i].name}:`, error);
          updatedDocs[i].status = 'error';
        }

        setProcessedDocs([...updatedDocs]);
        setProgress(((i + 1) / files.length) * 100);
      }

      onProcessingComplete(documents);
    };

    processFiles();
  }, [files, onProcessingComplete]);

  const getStatusIcon = (status: ProcessedDocument['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-gray-400" />;
      case 'processing':
        return <div className="h-4 w-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: ProcessedDocument['status']) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'processing':
        return 'default';
      case 'completed':
        return 'default';
      case 'error':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-6 w-6" />
          <span>Processing Documents</span>
        </CardTitle>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Processing {currentIndex + 1} of {files.length}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {processedDocs.map((doc, index) => (
            <div
              key={doc.id}
              className={`flex items-center justify-between p-4 rounded-lg border ${
                index === currentIndex && doc.status === 'processing'
                  ? 'border-indigo-200 bg-indigo-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                {getStatusIcon(doc.status)}
                <div className="flex-1">
                  <p className="font-medium text-sm">{doc.originalName}</p>
                  {doc.status === 'completed' && (
                    <p className="text-xs text-gray-500">
                      Classified as: <span className="font-medium">{doc.category}</span>
                      {doc.confidence > 0 && (
                        <span className="ml-2">({Math.round(doc.confidence * 100)}% confidence)</span>
                      )}
                    </p>
                  )}
                </div>
              </div>
              <Badge variant={getStatusColor(doc.status)}>
                {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
