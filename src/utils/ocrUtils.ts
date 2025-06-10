
import Tesseract from 'tesseract.js';

// Document categories and their keywords (based on your Python script)
const CATEGORIES = {
  "Aadhar": ["aadhar", "uidai", "govt of india", "government of india", "आधार"],
  "10th": ["10th", "class 10", "class x", "ssc", "high school", "हाई स्कूल", "दसवीं"],
  "12th": ["12th", "class 12", "class xii", "hsc", "senior secondary", "इंटरमीडिएट", "बारहवीं"],
  "Semester Marksheets": ["semester", "1st sem", "2nd sem", "3rd sem", "sgpa", "cgpa", "marks obtained"],
  "NPTEL": ["nptel", "motivated learners", "online certification", "discipline stars"],
  "Certificates": ["certificate", "completion", "recommendation", "achievement", "letter"]
};

interface ProcessingResult {
  category: string;
  confidence: number;
  ocrText: string;
}

export const processDocument = async (file: File): Promise<ProcessingResult> => {
  console.log(`Processing document: ${file.name}`);
  
  try {
    let ocrText = '';
    
    if (file.type === 'application/pdf') {
      // For PDFs, we'll extract text using a simplified approach
      // In a real implementation, you'd use pdf.js or similar
      ocrText = await extractTextFromPDF(file);
    } else if (file.type.startsWith('image/')) {
      // For images, use Tesseract.js
      ocrText = await extractTextFromImage(file);
    }
    
    console.log(`OCR Text Preview: ${ocrText.slice(0, 200)}`);
    
    const classification = classifyDocument(ocrText);
    
    return {
      category: classification.category,
      confidence: classification.confidence,
      ocrText: ocrText
    };
  } catch (error) {
    console.error(`Error processing ${file.name}:`, error);
    return {
      category: 'Unclassified',
      confidence: 0,
      ocrText: 'Error processing document'
    };
  }
};

const extractTextFromImage = async (file: File): Promise<string> => {
  const { data: { text } } = await Tesseract.recognize(
    file,
    'eng+hin', // English and Hindi languages
    {
      logger: m => console.log('OCR Progress:', m)
    }
  );
  
  return text.toLowerCase();
};

const extractTextFromPDF = async (file: File): Promise<string> => {
  // Simplified PDF text extraction
  // In a real implementation, you'd use pdf.js to convert PDF pages to images
  // and then run OCR on those images
  
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      // This is a very basic text extraction - in reality you'd need pdf.js
      const text = result.replace(/[^\x20-\x7E\u00A0-\uFFFF]/g, ' ').toLowerCase();
      resolve(text);
    };
    reader.readAsText(file);
  });
};

const classifyDocument = (text: string): { category: string; confidence: number } => {
  let bestMatch = { category: 'Unclassified', confidence: 0 };
  
  for (const [category, keywords] of Object.entries(CATEGORIES)) {
    let matches = 0;
    let totalKeywords = keywords.length;
    
    for (const keyword of keywords) {
      if (text.includes(keyword.toLowerCase())) {
        matches++;
      }
    }
    
    const confidence = matches / totalKeywords;
    
    if (confidence > bestMatch.confidence) {
      bestMatch = { category, confidence };
    }
  }
  
  // If confidence is too low, classify as unclassified
  if (bestMatch.confidence < 0.1) {
    bestMatch = { category: 'Unclassified', confidence: 0 };
  }
  
  return bestMatch;
};
