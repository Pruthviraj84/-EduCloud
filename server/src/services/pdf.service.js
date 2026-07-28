import fs from 'fs';
import pdfParse from 'pdf-parse';
import Tesseract from 'tesseract.js';

export const extractTextFromPDF = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);
    
    let extractedText = pdfData.text ? pdfData.text.trim() : '';

    // Fallback to OCR using Tesseract if text output length is under 100 chars (scanned PDF)
    if (extractedText.length < 100) {
      console.log('PDF text extracted is under 100 characters. Falling back to Tesseract OCR...');
      try {
        const { data: { text } } = await Tesseract.recognize(filePath, 'eng', {
          logger: m => console.log(`[OCR Status] ${m.status}: ${Math.round((m.progress || 0) * 100)}%`)
        });
        if (text && text.trim().length > 0) {
          extractedText = text.trim();
        }
      } catch (ocrErr) {
        console.error('Tesseract OCR fallback error:', ocrErr.message);
      }
    }

    return extractedText;
  } catch (error) {
    console.error('PDF Parsing Error:', error.message);
    throw new Error(`Failed to extract text from file: ${error.message}`);
  }
};
