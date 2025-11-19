import { InferSelectModel } from 'drizzle-orm';
import { projects, tickets, user } from './db/schema';

// DB Types
export type User = InferSelectModel<typeof user>;
export type Project = InferSelectModel<typeof projects>;
export type Ticket = InferSelectModel<typeof tickets>;

// Jira Types
export interface JiraResource {
  id: string;
  name: string;
  url: string;
  avatarUrl: string;
  scopes: string[];
}

export interface JiraProject {
  id: string;
  key: string;
  name: string;
  avatarUrls: {
    '48x48': string;
    '24x24': string;
    '16x16': string;
    '32x32': string;
  };
  projectTypeKey: string;
}

export interface JiraIssueField {
  type: string;
  content?: JiraIssueField[];
  text?: string;
  version?: number;
}

export interface JiraIssueData {
  fields: {
    project: { key: string };
    summary: string | null;
    description: {
      type: string;
      version: number;
      content: JiraIssueField[];
    };
    issuetype: { name: string };
    parent?: { key: string };
  };
}

// PDF Types
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

// Server Action Responses
export type ActionResponse<T = void> =
  | { success: true; data?: T; [key: string]: any } // Allow extra props for now to match existing patterns like pushedCount
  | { success: false; error: string };
