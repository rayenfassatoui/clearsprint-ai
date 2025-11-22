'use server';

import { headers } from 'next/headers';
import PDFParser from 'pdf2json';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { projects } from '@/lib/db/schema';
import { uploadFileToS3 } from '@/lib/s3';
import type { PdfData, PdfError, PdfPage, PdfText, PdfTextRun } from '@/types';

export async function uploadDoc(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { error: 'Unauthorized' };
  }

  const mode = formData.get('mode') as string; // 'file' | 'text'

  let url = '';
  let textContent = '';
  let fileName = '';

  if (mode === 'text') {
    const text = formData.get('text') as string;
    if (!text) return { error: 'No text provided' };

    textContent = text;
    const buffer = Buffer.from(text, 'utf-8');
    fileName = `paste-${Date.now()}.txt`;

    try {
      url = await uploadFileToS3(buffer, fileName, 'text/plain');
    } catch (error) {
      console.error('Upload error:', error);
      return { error: 'Failed to upload text content' };
    }
  } else {
    const file = formData.get('file') as File;

    if (!file) {
      return { error: 'No file provided' };
    }

    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit
      return { error: 'File size exceeds 10MB limit' };
    }

    fileName = file.name;

    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      url = await uploadFileToS3(buffer, file.name, file.type);

      // Extract text immediately
      if (file.type === 'application/pdf') {
        textContent = await new Promise<string>((resolve, reject) => {
          const pdfParser = new PDFParser(null, true); // true for raw text parsing enabled

          pdfParser.on('pdfParser_dataError', (errData: PdfError) => {
            const error =
              'parserError' in errData ? errData.parserError : errData;
            console.error(error);
            reject('Failed to parse PDF');
          });

          pdfParser.on('pdfParser_dataReady', (pdfData: PdfData) => {
            try {
              // Manual extraction to avoid RangeError in getRawTextContent()
              // The structure is usually pdfData.Pages[].Texts[].R[].T
              // T is URL encoded.
              const parsedText = pdfData.Pages.map((page: PdfPage) => {
                return page.Texts.map((text: PdfText) => {
                  // R is an array of text runs, usually just one
                  return text.R.map((run: PdfTextRun) =>
                    decodeURIComponent(run.T),
                  ).join(' ');
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
    } catch (error) {
      console.error('Upload error:', error);
      return { error: 'Failed to upload document' };
    }
  }

  try {
    const [newProject] = await db
      .insert(projects)
      .values({
        userId: session.user.id,
        name: fileName,
        docUrl: url,
        rawText: textContent,
      })
      .returning();

    return {
      success: true,
      url,
      text: textContent,
      projectId: newProject.id,
    };
  } catch (error) {
    console.error('Database error:', error);
    return { error: 'Failed to save project' };
  }
}
