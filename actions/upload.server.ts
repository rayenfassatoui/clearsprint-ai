'use server';

import { uploadFileToS3 } from '@/lib/s3';
import PDFParser from 'pdf2json';

export async function uploadDoc(formData: FormData) {
  const mode = formData.get('mode') as string; // 'file' | 'text'

  if (mode === 'text') {
    const text = formData.get('text') as string;
    if (!text) return { error: 'No text provided' };

    // For text mode, we might want to save it as a .txt file in S3 as well for consistency
    // or just return it. The requirement says "store URL".
    // So let's upload it as a .txt file.
    const buffer = Buffer.from(text, 'utf-8');
    const fileName = `paste-${Date.now()}.txt`;

    try {
      const url = await uploadFileToS3(buffer, fileName, 'text/plain');
      return { success: true, url, text };
    } catch (error) {
      console.error('Upload error:', error);
      return { error: 'Failed to upload text content' };
    }
  }

  const file = formData.get('file') as File;

  if (!file) {
    return { error: 'No file provided' };
  }

  if (file.size > 10 * 1024 * 1024) {
    // 10MB limit
    return { error: 'File size exceeds 10MB limit' };
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadFileToS3(buffer, file.name, file.type);

    // Extract text immediately
    let textContent = '';
    if (file.type === 'application/pdf') {
      textContent = await new Promise<string>((resolve, reject) => {
        const pdfParser = new PDFParser(null, true); // true for raw text parsing enabled

        pdfParser.on('pdfParser_dataError', (errData: any) => {
          console.error(errData.parserError);
          reject('Failed to parse PDF');
        });

        pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
          try {
            // Manual extraction to avoid RangeError in getRawTextContent()
            // The structure is usually pdfData.Pages[].Texts[].R[].T
            // T is URL encoded.
            const parsedText = pdfData.Pages.map((page: any) => {
              return page.Texts.map((text: any) => {
                // R is an array of text runs, usually just one
                return text.R.map((run: any) => decodeURIComponent(run.T)).join(
                  ' '
                );
              }).join(' ');
            }).join('\n\n');

            resolve(parsedText);
          } catch (err) {
            console.error('Error manually parsing PDF JSON:', err);
            reject('Failed to parse PDF content');
          }
        });

        pdfParser.parseBuffer(buffer);
      });
    } else if (file.type === 'text/plain') {
      textContent = buffer.toString('utf-8');
    } else {
      textContent = 'Text extraction not supported for this file type yet.';
    }

    return {
      success: true,
      url,
      text: textContent,
    };
  } catch (error) {
    console.error('Upload error:', error);
    return { error: 'Failed to upload document' };
  }
}
