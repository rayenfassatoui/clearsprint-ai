// PDF Parsing Types

export interface PdfTextRun {
  T: string;
}

export interface PdfText {
  R: PdfTextRun[];
}

export interface PdfPage {
  Texts: PdfText[];
}

export interface PdfData {
  Pages: PdfPage[];
}

export type PdfError = Error | { parserError: Error };
