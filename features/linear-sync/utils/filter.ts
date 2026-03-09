import type { WorkspaceTicket } from '@/lib/types';
import type { TicketDraftData } from '../types';

/**
 * Filters workspace tickets by search query and status.
 * Extracted from workspace-client for cleanliness and testability.
 */
export function filterTickets(
  tickets: WorkspaceTicket[],
  search: string,
  statusFilter: string,
): WorkspaceTicket[] {
  const query = search.toLowerCase().trim();

  return tickets.filter((t) => {
    const draft = t.draftData as TicketDraftData | null;
    const original = t.originalData as Record<string, unknown> | null;

    const title = (draft?.title ?? original?.title ?? '') as string;
    const ident = (t.linearIdentifier ?? '').toLowerCase();

    // Text search
    const matchesSearch =
      !query || title.toLowerCase().includes(query) || ident.includes(query);

    // Status filter
    let matchesStatus = true;
    if (statusFilter !== 'all') {
      const statusName = (
        (draft?.statusName ?? original?.statusName ?? '') as string
      ).toLowerCase();
      matchesStatus = statusName.includes(statusFilter.replaceAll('_', ' '));
    }

    return matchesSearch && matchesStatus;
  });
}
