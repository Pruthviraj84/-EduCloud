import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import officeparser from 'officeparser';
import Tesseract from 'tesseract.js';
import axios from 'axios';

/**
 * Extracts plain text from a local file path or remote Cloudinary URL.
 * Supports PDF, DOCX, PPT, PPTX, and Image files.
 * Throws explicit error if extraction fails or text is empty ("Never continue with empty text").
 */
export const extractTextFromFile = async (filePathOrUrl) => {
  if (!filePathOrUrl) {
    throw new Error('File path or URL is invalid');
  }

  console.log(`[Text Extraction Started] Processing target: ${filePathOrUrl}`);

  let isRemoteUrl = false;
  let localTempPath = filePathOrUrl;
  let fileBuffer = null;

  try {
    if (filePathOrUrl.startsWith('http://') || filePathOrUrl.startsWith('https://')) {
      isRemoteUrl = true;
      console.log(`[Text Extraction] Downloading remote Cloudinary resource from ${filePathOrUrl}...`);
      const response = await axios.get(filePathOrUrl, { responseType: 'arraybuffer' });
      fileBuffer = Buffer.from(response.data);
      
      const fileName = filePathOrUrl.split('/').pop().split('?')[0] || `temp_${Date.now()}.pdf`;
      localTempPath = path.join('uploads', `extracted_${Date.now()}_${fileName}`);
      fs.writeFileSync(localTempPath, fileBuffer);
    } else {
      if (!fs.existsSync(filePathOrUrl)) {
        throw new Error(`File does not exist at local path: ${filePathOrUrl}`);
      }
      fileBuffer = fs.readFileSync(filePathOrUrl);
    }

    const ext = path.extname(localTempPath).toLowerCase();
    let extractedText = '';

    if (ext === '.pdf') {
      console.log('[FileExtraction] Parsing PDF buffer with pdf-parse...');
      const pdfData = await pdfParse(fileBuffer);
      extractedText = pdfData.text ? pdfData.text.trim() : '';

      // Tesseract OCR fallback for scanned PDFs with < 100 characters
      if (extractedText.length < 100) {
        console.log('[FileExtraction] PDF text under 100 chars. Running Tesseract OCR fallback...');
        try {
          const { data: { text } } = await Tesseract.recognize(localTempPath, 'eng');
          if (text && text.trim().length > 0) {
            extractedText = text.trim();
          }
        } catch (ocrErr) {
          console.error('[FileExtraction] OCR Fallback Error:', ocrErr.message);
        }
      }
    } else if (ext === '.docx' || ext === '.doc') {
      console.log('[FileExtraction] Parsing Word document with mammoth...');
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      extractedText = result.value ? result.value.trim() : '';
    } else if (ext === '.ppt' || ext === '.pptx') {
      console.log('[FileExtraction] Parsing PowerPoint presentation with officeparser...');
      try {
        const text = await officeparser.parseOfficeAsync(localTempPath);
        extractedText = typeof text === 'string' ? text.trim() : JSON.stringify(text);
      } catch (pptErr) {
        console.error('[FileExtraction] OfficeParser Error:', pptErr.message);
      }
    } else if (['.png', '.jpg', '.jpeg', '.webp', '.bmp'].includes(ext)) {
      console.log('[FileExtraction] Running Tesseract OCR on image file...');
      const { data: { text } } = await Tesseract.recognize(localTempPath, 'eng', {
        logger: m => {
          if (m.status === 'recognizing text') {
            console.log(`[OCR Progress] ${Math.round((m.progress || 0) * 100)}%`);
          }
        }
      });
      extractedText = text ? text.trim() : '';
    } else {
      console.log('[FileExtraction] Fallback reading plain text file...');
      extractedText = fileBuffer.toString('utf-8').trim();
    }

    // Cleanup temp file if downloaded from URL
    if (isRemoteUrl && fs.existsSync(localTempPath)) {
      try { fs.unlinkSync(localTempPath); } catch (e) {}
    }

    if (!extractedText || extractedText.trim().length === 0) {
      throw new Error(`Text extraction produced empty result from ${path.basename(localTempPath)}. Never continue with empty text.`);
    }

    console.log(`[Text Extraction Success] Extracted ${extractedText.length} characters successfully.`);
    return extractedText.trim();
  } catch (error) {
    if (isRemoteUrl && fs.existsSync(localTempPath)) {
      try { fs.unlinkSync(localTempPath); } catch (e) {}
    }
    console.error(`[Text Extraction Failure]`, error.message);
    throw new Error(`Text Extraction Service Error: ${error.message}`);
  }
};
