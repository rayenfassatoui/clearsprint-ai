'use server';

import { db } from '@/lib/db';
import { workspaceProjects, workspaceTickets } from '@/lib/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { getLinearClient } from '@/lib/linear';
import type { ActionResponse } from '@/lib/types';
import { runInBatches } from '../utils/batch';
import type { LinearIssueData, TicketDraftData } from '../types';
import { computeTicketHash } from '../utils/hash';
import { revalidatePath } from 'next/cache';
import type { Issue } from '@linear/sdk';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : 'Unknown error';
}

/**
 * Safety-first patch builder.
 * Only includes fields that are explicitly present in draftData AND differ from originalData.
 * If a field was not touched by the user, it will NOT be sent to Linear.
 */
function buildUpdatePayload(
  original: LinearIssueData,
  draft: TicketDraftData,
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};

  if (draft.title !== undefined && draft.title !== original.title) {
    payload.title = draft.title;
  }

  if (
    draft.description !== undefined &&
    draft.description !== original.description
  ) {
    payload.description = draft.description ?? '';
  }

  if (draft.priority !== undefined && draft.priority !== original.priority) {
    payload.priority = draft.priority;
  }

  // Status: use statusId if present, otherwise skip
  if (
    draft.statusId !== undefined &&
    draft.statusId !== original.statusId &&
    draft.statusId
  ) {
    payload.stateId = draft.statusId;
  }

  // Assignee
  if (
    draft.assigneeId !== undefined &&
    draft.assigneeId !== original.assigneeId
  ) {
    payload.assigneeId = draft.assigneeId ?? undefined; // null clears it
  }

  // Labels: compare by sorted ID arrays
  if (draft.labelIds !== undefined) {
    const origSorted = [...(original.labelIds ?? [])].sort().join(',');
    const draftSorted = [...draft.labelIds].sort().join(',');
    if (origSorted !== draftSorted) {
      payload.labelIds = draft.labelIds;
    }
  }

  // Estimate
  if (draft.estimate !== undefined && draft.estimate !== original.estimate) {
    payload.estimate = draft.estimate ?? undefined;
  }

  // Due date
  if (draft.dueDate !== undefined && draft.dueDate !== original.dueDate) {
    payload.dueDate = draft.dueDate ?? undefined;
  }

  // Parent
  if (draft.parentId !== undefined && draft.parentId !== original.parentId) {
    payload.parentId = draft.parentId ?? undefined;
  }

  return payload;
}

/**
 * Re-normalizes a Linear issue after a push to get a fresh snapshot for originalData.
 * Resolves all async relations in parallel.
 */
async function refreshIssueData(issue: Issue): Promise<LinearIssueData> {
  const [
    stateInfo,
    assigneeInfo,
    labelsConn,
    parentInfo,
    childrenConn,
    subscribersConn,
  ] = await Promise.all([
    issue.state,
    issue.assignee,
    issue.labels(),
    issue.parent,
    issue.children(),
    issue.subscribers(),
  ]);

  return {
    id: issue.id,
    identifier: issue.identifier,
    title: issue.title,
    description: issue.description ?? null,
    statusName: stateInfo?.name ?? 'Backlog',
    statusId: stateInfo?.id ?? '',
    priority: issue.priority ?? 0,
    assigneeId: assigneeInfo?.id ?? null,
    assigneeName: assigneeInfo?.name ?? null,
    labels: labelsConn.nodes.map((l) => l.name),
    labelIds: labelsConn.nodes.map((l) => l.id),
    estimate: (issue.estimate as number | null | undefined) ?? null,
    dueDate: (issue.dueDate as string | null | undefined) ?? null,
    parentId: parentInfo?.id ?? null,
    parentIdentifier: parentInfo?.identifier ?? null,
    childIdentifiers: childrenConn.nodes.map((c) => c.identifier),
    subscriberIds: subscribersConn.nodes.map((s) => s.id),
  };
}

// ─── Main Action ─────────────────────────────────────────────────────────────

export async function pushToLinear(
  userId: string,
  workspaceProjectId: number,
  ticketIds?: number[],
): Promise<ActionResponse<{ pushed: number; failed: number }>> {
  try {
    const client = await getLinearClient(userId);
    if (!client)
      return { success: false, error: 'Linear account not connected' };

    const [project] = await db
      .select()
      .from(workspaceProjects)
      .where(
        and(
          eq(workspaceProjects.id, workspaceProjectId),
          eq(workspaceProjects.userId, userId),
        ),
      )
      .limit(1);

    if (!project)
      return { success: false, error: 'Workspace project not found' };

    if (!project.linearTeamId) {
      return {
        success: false,
        error: 'Workspace project has no associated Linear team',
      };
    }

    const teamId = project.linearTeamId;

    // Build query for tickets to push
    const pendingTickets = await (ticketIds && ticketIds.length > 0
      ? db
          .select()
          .from(workspaceTickets)
          .where(
            and(
              eq(workspaceTickets.workspaceProjectId, project.id),
              inArray(workspaceTickets.id, ticketIds),
            ),
          )
      : db
          .select()
          .from(workspaceTickets)
          .where(
            and(
              eq(workspaceTickets.workspaceProjectId, project.id),
              inArray(workspaceTickets.syncStatus, ['modified', 'new_local']),
            ),
          ));

    if (pendingTickets.length === 0) {
      return { success: true, data: { pushed: 0, failed: 0 } };
    }

    let successCount = 0;
    let failCount = 0;

    // Push a single ticket — either create or update
    const pushTask = async (ticket: (typeof pendingTickets)[0]) => {
      try {
        const draft = ticket.draftData as TicketDraftData | null;
        const original = ticket.originalData as LinearIssueData | null;

        if (!draft) return { ticketId: ticket.id, success: false as const };

        // ── CREATE (new_local) ─────────────────────────────────────────────
        if (ticket.syncStatus === 'new_local') {
          const res = await client.createIssue({
            teamId,
            projectId: project.linearProjectId,
            title: draft.title?.trim() || 'Untitled Issue',
            description: draft.description ?? undefined,
            priority: draft.priority ?? 0,
            stateId: draft.statusId ?? undefined,
            assigneeId: draft.assigneeId ?? undefined,
            labelIds: draft.labelIds ?? undefined,
            estimate: draft.estimate ?? undefined,
            dueDate: draft.dueDate ?? undefined,
            parentId: draft.parentId ?? undefined,
          });

          if (res.success) {
            const issue = await res.issue;
            if (issue) {
              const freshData = await refreshIssueData(issue);
              const hash = await computeTicketHash(freshData);
              await db
                .update(workspaceTickets)
                .set({
                  linearIssueId: issue.id,
                  linearIdentifier: issue.identifier,
                  originalData: freshData,
                  originalHash: hash,
                  draftData: null,
                  syncStatus: 'synced',
                  parentLinearIdentifier: freshData.parentIdentifier,
                  updatedAt: new Date(),
                })
                .where(eq(workspaceTickets.id, ticket.id));
              return { ticketId: ticket.id, success: true as const };
            }
          }
          return { ticketId: ticket.id, success: false as const };
        }

        // ── UPDATE (modified) ─────────────────────────────────────────────
        if (
          (ticket.syncStatus === 'modified' ||
            ticket.syncStatus === 'push_failed') &&
          ticket.linearIssueId &&
          original
        ) {
          // Build a field-level patch — only what changed
          const updatePayload = buildUpdatePayload(original, draft);

          if (Object.keys(updatePayload).length === 0) {
            // Nothing meaningfully changed — clear the draft and mark synced
            await db
              .update(workspaceTickets)
              .set({
                draftData: null,
                syncStatus: 'synced',
                updatedAt: new Date(),
              })
              .where(eq(workspaceTickets.id, ticket.id));
            return { ticketId: ticket.id, success: true as const };
          }

          const res = await client.updateIssue(
            ticket.linearIssueId,
            updatePayload,
          );

          if (res.success) {
            const issue = await res.issue;
            if (issue) {
              // Re-pull fresh data (includes fields we didn't touch) as new snapshot
              const freshData = await refreshIssueData(issue);
              const hash = await computeTicketHash(freshData);
              await db
                .update(workspaceTickets)
                .set({
                  originalData: freshData,
                  originalHash: hash,
                  draftData: null,
                  syncStatus: 'synced',
                  parentLinearIdentifier: freshData.parentIdentifier,
                  updatedAt: new Date(),
                })
                .where(eq(workspaceTickets.id, ticket.id));
              return { ticketId: ticket.id, success: true as const };
            }
          }
          return { ticketId: ticket.id, success: false as const };
        }

        return { ticketId: ticket.id, success: false as const };
      } catch (err) {
        console.error('Failed to push ticket', ticket.id, getErrorMessage(err));
        return { ticketId: ticket.id, success: false as const };
      }
    };

    // Run in batches of 5 to avoid Linear rate limits
    const results = await runInBatches(pendingTickets, 5, pushTask);

    for (const r of results) {
      if (r.success) {
        successCount++;
      } else {
        failCount++;
        await db
          .update(workspaceTickets)
          .set({ syncStatus: 'push_failed', updatedAt: new Date() })
          .where(eq(workspaceTickets.id, r.ticketId));
      }
    }

    revalidatePath(`/dashboard/workspace/${workspaceProjectId}`);
    return { success: true, data: { pushed: successCount, failed: failCount } };
  } catch (error) {
    console.error('pushToLinear error:', getErrorMessage(error));
    return { success: false, error: 'Push to Linear failed unexpectedly' };
  }
}
