'use server';

import { db } from '@/lib/db';
import { workspaceProjects, workspaceTickets } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import type { ActionResponse, WorkspaceTicket } from '@/lib/types';
import type { TicketDraftData } from '../types';
import { revalidatePath } from 'next/cache';

/**
 * Returns the current authenticated user or throws if not authenticated.
 */
async function getCurrentUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error('Unauthorized');
  return session.user;
}

/**
 * Saves local draft edits to a workspace ticket.
 * Only the explicitly passed fields are merged into the existing draft.
 * Ownership is verified before any write.
 */
export async function updateTicketDraft(
  ticketId: number,
  draftData: TicketDraftData,
): Promise<ActionResponse<WorkspaceTicket>> {
  try {
    const user = await getCurrentUser();

    // Fetch ticket and verify it belongs to this user's workspace
    const [ticket] = await db
      .select({
        ticket: workspaceTickets,
        projectUserId: workspaceProjects.userId,
      })
      .from(workspaceTickets)
      .innerJoin(
        workspaceProjects,
        eq(workspaceTickets.workspaceProjectId, workspaceProjects.id),
      )
      .where(eq(workspaceTickets.id, ticketId))
      .limit(1);

    if (!ticket) return { success: false, error: 'Ticket not found' };
    if (ticket.projectUserId !== user.id)
      return { success: false, error: 'Unauthorized' };

    // Merge new draft fields on top of any existing draft
    const mergedDraft = {
      ...((ticket.ticket.draftData as Record<string, unknown> | null) ?? {}),
      ...draftData,
    };

    const nextStatus =
      ticket.ticket.syncStatus === 'synced'
        ? 'modified'
        : ticket.ticket.syncStatus;

    const [updatedTicket] = await db
      .update(workspaceTickets)
      .set({
        draftData: mergedDraft,
        syncStatus: nextStatus as WorkspaceTicket['syncStatus'],
        updatedAt: new Date(),
      })
      .where(eq(workspaceTickets.id, ticketId))
      .returning();

    revalidatePath(`/dashboard/workspace/${ticket.ticket.workspaceProjectId}`);
    return { success: true, data: updatedTicket };
  } catch (err) {
    if (err instanceof Error && err.message === 'Unauthorized') {
      return { success: false, error: 'Unauthorized' };
    }
    console.error('updateTicketDraft error:', err);
    return { success: false, error: 'Failed to save draft' };
  }
}

/**
 * Deletes a locally-created ticket that has never been pushed to Linear.
 * Only tickets with syncStatus 'new_local' can be deleted this way.
 */
export async function deleteLocalTicket(
  ticketId: number,
): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser();

    const [row] = await db
      .select({
        ticket: workspaceTickets,
        projectUserId: workspaceProjects.userId,
      })
      .from(workspaceTickets)
      .innerJoin(
        workspaceProjects,
        eq(workspaceTickets.workspaceProjectId, workspaceProjects.id),
      )
      .where(eq(workspaceTickets.id, ticketId))
      .limit(1);

    if (!row) return { success: false, error: 'Ticket not found' };
    if (row.projectUserId !== user.id)
      return { success: false, error: 'Unauthorized' };
    if (row.ticket.syncStatus !== 'new_local') {
      return {
        success: false,
        error:
          'Only locally-created tickets that have not been pushed can be deleted here.',
      };
    }

    await db.delete(workspaceTickets).where(eq(workspaceTickets.id, ticketId));

    revalidatePath(`/dashboard/workspace/${row.ticket.workspaceProjectId}`);
    return { success: true };
  } catch (err) {
    if (err instanceof Error && err.message === 'Unauthorized') {
      return { success: false, error: 'Unauthorized' };
    }
    console.error('deleteLocalTicket error:', err);
    return { success: false, error: 'Failed to delete ticket' };
  }
}

/**
 * Discards the local draft on a ticket, reverting it to its last-synced state.
 */
export async function discardTicketDraft(
  ticketId: number,
): Promise<ActionResponse<WorkspaceTicket>> {
  try {
    const user = await getCurrentUser();

    const [row] = await db
      .select({
        ticket: workspaceTickets,
        projectUserId: workspaceProjects.userId,
      })
      .from(workspaceTickets)
      .innerJoin(
        workspaceProjects,
        eq(workspaceTickets.workspaceProjectId, workspaceProjects.id),
      )
      .where(eq(workspaceTickets.id, ticketId))
      .limit(1);

    if (!row) return { success: false, error: 'Ticket not found' };
    if (row.projectUserId !== user.id)
      return { success: false, error: 'Unauthorized' };

    const [updated] = await db
      .update(workspaceTickets)
      .set({ draftData: null, syncStatus: 'synced', updatedAt: new Date() })
      .where(eq(workspaceTickets.id, ticketId))
      .returning();

    revalidatePath(`/dashboard/workspace/${row.ticket.workspaceProjectId}`);
    return { success: true, data: updated };
  } catch (err) {
    if (err instanceof Error && err.message === 'Unauthorized') {
      return { success: false, error: 'Unauthorized' };
    }
    console.error('discardTicketDraft error:', err);
    return { success: false, error: 'Failed to discard draft' };
  }
}
