
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProcessedDocument } from '@/pages/Index';
import { Download, RotateCcw, FolderOpen, FileText, Eye } from 'lucide-react';
import { downloadSortedDocuments } from '@/utils/downloadUtils';

interface ResultsPanelProps {
  documents: ProcessedDocument[];
  onReset: () => void;
}

export const ResultsPanel: React.FC<ResultsPanelProps> = ({
  documents,
  onReset,
}) => {
  const [selectedDoc, setSelectedDoc] = useState<ProcessedDocument | null>(null);

  // Group documents by category
  const groupedDocs = documents.reduce((acc, doc) => {
    if (!acc[doc.category]) {
      acc[doc.category] = [];
    }
    acc[doc.category].push(doc);
    return acc;
  }, {} as Record<string, ProcessedDocument[]>);

  const categories = Object.keys(groupedDocs);
  const totalDocs = documents.length;
  const successfulDocs = documents.filter(doc => doc.status === 'completed').length;

  const handleDownloadAll = async () => {
    try {
      await downloadSortedDocuments(groupedDocs);
    } catch (error) {
      console.error('Error downloading files:', error);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Aadhar': 'bg-blue-100 text-blue-800',
      '10th': 'bg-green-100 text-green-800',
      '12th': 'bg-purple-100 text-purple-800',
      'Semester Marksheets': 'bg-orange-100 text-orange-800',
      'NPTEL': 'bg-yellow-100 text-yellow-800',
      'Certificates': 'bg-pink-100 text-pink-800',
      'Unclassified': 'bg-gray-100 text-gray-800',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <FolderOpen className="h-6 w-6" />
              <span>Processing Results</span>
            </CardTitle>
            <div className="flex space-x-2">
              <Button
                onClick={handleDownloadAll}
                className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700"
              >
                <Download className="h-4 w-4" />
                <span>Download All</span>
              </Button>
              <Button
                onClick={onReset}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Start Over</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-indigo-600">{totalDocs}</p>
              <p className="text-sm text-gray-600">Total Documents</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{successfulDocs}</p>
              <p className="text-sm text-gray-600">Successfully Processed</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">{categories.length}</p>
              <p className="text-sm text-gray-600">Categories Found</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Category Overview</TabsTrigger>
          <TabsTrigger value="details">Document Details</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Card key={category}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-lg">{category}</h3>
                    <Badge className={getCategoryColor(category)}>
                      {groupedDocs[category].length}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {groupedDocs[category].slice(0, 3).map((doc) => (
                      <div key={doc.id} className="text-sm text-gray-600 truncate">
                        {doc.originalName}
                      </div>
                    ))}
                    {groupedDocs[category].length > 3 && (
                      <div className="text-xs text-gray-500">
                        +{groupedDocs[category].length - 3} more...
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="details">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium">{doc.originalName}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={getCategoryColor(doc.category)} variant="secondary">
                            {doc.category}
                          </Badge>
                          {doc.confidence > 0 && (
                            <span className="text-xs text-gray-500">
                              {Math.round(doc.confidence * 100)}% confidence
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => setSelectedDoc(doc)}
                      variant="ghost"
                      size="sm"
                      className="flex items-center space-x-1"
                    >
                      <Eye className="h-4 w-4" />
                      <span>Preview</span>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Document Preview Modal */}
      {selectedDoc && (
        <Card className="mt-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Document Preview: {selectedDoc.originalName}</CardTitle>
              <Button
                onClick={() => setSelectedDoc(null)}
                variant="ghost"
                size="sm"
              >
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Classification Details</h4>
                <div className="flex items-center space-x-2">
                  <Badge className={getCategoryColor(selectedDoc.category)}>
                    {selectedDoc.category}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    Confidence: {Math.round(selectedDoc.confidence * 100)}%
                  </span>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Extracted Text (Preview)</h4>
                <div className="bg-gray-50 p-4 rounded-lg max-h-40 overflow-y-auto">
                  <p className="text-sm text-gray-700">
                    {selectedDoc.ocrText.slice(0, 500)}
                    {selectedDoc.ocrText.length > 500 && '...'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
