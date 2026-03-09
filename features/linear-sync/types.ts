import { z } from 'zod';

// ─── Sync Status ──────────────────────────────────────────────────────────────

export type SyncStatusType =
  | 'synced'
  | 'modified'
  | 'new_local'
  | 'new_remote'
  | 'remote_updated'
  | 'remote_deleted'
  | 'push_failed';

// ─── Full Linear Issue Snapshot ───────────────────────────────────────────────
// Stored in `originalData`. Contains BOTH IDs (for push) and names (for display).

export interface LinearIssueData {
  // Identity
  id: string; // Linear UUID
  identifier: string; // e.g. "PROJ-123"

  // Core content
  title: string;
  description: string | null;

  // Status — name for display, ID for API writes
  statusName: string;
  statusId: string;

  // Priority: 0=No Priority, 1=Urgent, 2=High, 3=Medium, 4=Low
  priority: number;

  // Assignee
  assigneeId: string | null;
  assigneeName: string | null;

  // Labels — names for display, IDs for API writes
  labels: string[];
  labelIds: string[];

  // Estimate (story points / complexity)
  estimate: number | null;

  // Due date (ISO date string, e.g. "2025-04-01")
  dueDate: string | null;

  // Hierarchy
  parentId: string | null; // Linear UUID of parent issue
  parentIdentifier: string | null; // e.g. "PROJ-1" (for display)

  // Sub-issues (children) — identifiers for display
  childIdentifiers: string[];

  // Subscribers / followers — user IDs
  subscriberIds: string[];
}

// ─── Draft (User Edits) ───────────────────────────────────────────────────────
// Only fields that were explicitly changed are present.
// Absence of a key = field was NOT touched = will NOT be sent to Linear on push.

export interface TicketDraftData {
  title?: string;
  description?: string;
  statusName?: string;
  statusId?: string;
  priority?: number;
  assigneeId?: string | null;
  assigneeName?: string | null;
  labels?: string[];
  labelIds?: string[];
  estimate?: number | null;
  dueDate?: string | null;
  parentId?: string | null;
  parentIdentifier?: string | null;
}

// ─── Zod Schemas (AI output validation) ──────────────────────────────────────

export const TicketUpdateSchema = z.object({
  title: z.string().optional(),
  description: z.string().nullable().optional(),
  statusName: z.string().optional(),
  statusId: z.string().optional(),
  priority: z.number().min(0).max(4).optional(),
  assigneeId: z.string().nullable().optional(),
  assigneeName: z.string().nullable().optional(),
  labels: z.array(z.string()).optional(),
  labelIds: z.array(z.string()).optional(),
  estimate: z.number().nullable().optional(),
  dueDate: z.string().nullable().optional(),
  parentId: z.string().nullable().optional(),
  parentIdentifier: z.string().nullable().optional(),
});
export type TicketUpdateInput = z.infer<typeof TicketUpdateSchema>;

export const TicketCreateSchema = z.object({
  title: z.string(),
  description: z.string().nullable().optional(),
  statusName: z.string().optional(),
  statusId: z.string().optional(),
  priority: z.number().min(0).max(4).optional(),
  assigneeId: z.string().nullable().optional(),
  labels: z.array(z.string()).optional(),
  labelIds: z.array(z.string()).optional(),
  estimate: z.number().nullable().optional(),
  dueDate: z.string().nullable().optional(),
  parentId: z.string().nullable().optional(),
});
export type TicketCreateInput = z.infer<typeof TicketCreateSchema>;

// ─── Diff ─────────────────────────────────────────────────────────────────────

export type DiffableField = keyof Pick<
  LinearIssueData,
  | 'title'
  | 'description'
  | 'statusName'
  | 'priority'
  | 'assigneeName'
  | 'labels'
  | 'estimate'
  | 'dueDate'
  | 'parentIdentifier'
>;

export interface TicketDiff {
  field: DiffableField | string;
  changeType: 'added' | 'removed' | 'modified';
  oldValue: unknown;
  newValue: unknown;
}
