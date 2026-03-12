/**
 * Shared Linear sync status utilities.
 * Single source of truth for status labels, colors, and priority display.
 */
import type { SyncStatusType } from '../types';

// ─── Sync Status ──────────────────────────────────────────────────────────────

export const SYNC_STATUS_LABELS: Record<SyncStatusType, string> = {
  synced: 'Synced',
  modified: 'Draft',
  new_local: 'New',
  new_remote: 'New (Remote)',
  remote_updated: 'Remote Changed',
  remote_deleted: 'Deleted on Linear',
  push_failed: 'Push Failed',
};

export const SYNC_STATUS_STYLES: Record<SyncStatusType, string> = {
  synced: 'bg-muted/50 text-muted-foreground border-transparent',
  modified: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  new_local: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  new_remote: 'bg-sky-500/10 text-sky-600 border-sky-500/20',
  remote_updated: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  remote_deleted: 'bg-red-500/10 text-red-600 border-red-500/20',
  push_failed: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
};

/** Kanban column accent colors (top border) per status name */
export const KANBAN_STATUS_ACCENT: Record<string, string> = {
  Backlog: 'border-t-muted-foreground/30',
  Todo: 'border-t-sky-400/60',
  'In Progress': 'border-t-amber-400/70',
  'In Review': 'border-t-purple-400/70',
  Done: 'border-t-emerald-400/70',
  Canceled: 'border-t-rose-400/50',
};

export function getKanbanAccent(status: string): string {
  return KANBAN_STATUS_ACCENT[status] ?? 'border-t-muted-foreground/20';
}

// ─── Priority ─────────────────────────────────────────────────────────────────

export interface PriorityMeta {
  label: string;
  color: string;
  dotColor: string;
}

export const PRIORITY_MAP: Record<number, PriorityMeta> = {
  0: {
    label: 'No Priority',
    color: 'text-muted-foreground',
    dotColor: 'bg-muted-foreground/40',
  },
  1: { label: 'Urgent', color: 'text-rose-500', dotColor: 'bg-rose-500' },
  2: { label: 'High', color: 'text-orange-500', dotColor: 'bg-orange-500' },
  3: { label: 'Medium', color: 'text-amber-500', dotColor: 'bg-amber-400' },
  4: { label: 'Low', color: 'text-sky-400', dotColor: 'bg-sky-400' },
};

import {
  Circle,
  CheckCircle2,
  CircleDashed,
  ArrowRightCircle,
  XCircle,
  AlertCircle,
  SignalHigh,
  SignalMedium,
  SignalLow,
  Ban,
  type LucideIcon,
} from 'lucide-react';

export function getPriorityMeta(priority: number): PriorityMeta {
  return PRIORITY_MAP[priority] ?? PRIORITY_MAP[0];
}

export function getPriorityIcon(priority: number): LucideIcon {
  switch (priority) {
    case 1: return AlertCircle;
    case 2: return SignalHigh;
    case 3: return SignalMedium;
    case 4: return SignalLow;
    default: return Ban;
  }
}

export function getPriorityLabel(priority: number): string {
  return PRIORITY_MAP[priority]?.label ?? 'No Priority';
}

export function getStatusColor(statusName: string): string {
  switch (statusName.toLowerCase()) {
    case 'done':
      return 'text-emerald-500 bg-emerald-500/10';
    case 'in progress':
      return 'text-amber-500 bg-amber-500/10';
    case 'in review':
      return 'text-purple-500 bg-purple-500/10';
    case 'canceled':
      return 'text-rose-500 bg-rose-500/10';
    case 'todo':
      return 'text-sky-500 bg-sky-500/10';
    default:
      return 'text-muted-foreground bg-muted/20'; // backlog
  }
}

export function getStatusIcon(statusName: string): LucideIcon {
  switch (statusName.toLowerCase()) {
    case 'done':
      return CheckCircle2;
    case 'in progress':
      return ArrowRightCircle;
    case 'in review':
      return AlertCircle;
    case 'canceled':
      return XCircle;
    case 'todo':
      return Circle;
    default:
      return CircleDashed; // backlog
  }
}

// ─── Merged display data helper ───────────────────────────────────────────────

import type { LinearIssueData, TicketDraftData } from '../types';
import type { WorkspaceTicket } from '@/lib/types';

/**
 * Returns the merged display data for a workspace ticket:
 * originalData merged with draftData (draft takes precedence).
 */
export function getDisplayData(ticket: WorkspaceTicket): LinearIssueData {
  const original = ticket.originalData as LinearIssueData | null;
  const draft = ticket.draftData as TicketDraftData | null;

  if (!draft) return original ?? ({} as LinearIssueData);

  return {
    ...(original ?? {}),
    ...draft,
  } as LinearIssueData;
}
