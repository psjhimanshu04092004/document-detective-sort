
import JSZip from 'jszip';
import { ProcessedDocument } from '@/pages/Index';

export const downloadSortedDocuments = async (groupedDocs: Record<string, ProcessedDocument[]>) => {
  const zip = new JSZip();
  
  // Create folders for each category and add files
  for (const [category, documents] of Object.entries(groupedDocs)) {
    const folder = zip.folder(category);
    
    for (const doc of documents) {
      if (folder) {
        folder.file(doc.originalName, doc.file);
      }
    }
  }
  
  // Generate the zip file
  const content = await zip.generateAsync({ type: 'blob' });
  
  // Create download link
  const url = URL.createObjectURL(content);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'sorted_documents.zip';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
