import type { InferSelectModel } from 'drizzle-orm';
import type {
  projects,
  tickets,
  user,
  workspaceProjects,
  workspaceTickets,
} from './db/schema';

// DB Types
export type User = InferSelectModel<typeof user>;
export type Project = InferSelectModel<typeof projects>;
export type Ticket = InferSelectModel<typeof tickets>;
export type WorkspaceProject = InferSelectModel<typeof workspaceProjects>;
export type WorkspaceTicket = InferSelectModel<typeof workspaceTickets>;

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
