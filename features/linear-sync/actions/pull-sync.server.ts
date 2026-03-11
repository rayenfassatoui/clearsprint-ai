'use server';

import { db } from '@/lib/db';
import { workspaceProjects, workspaceTickets } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getLinearClient } from '@/lib/linear';
import { computeTicketHash } from '../utils/hash';
import type { LinearIssueData } from '../types';
import type { Issue } from '@linear/sdk';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

// Maximum issues per page (Linear's documented maximum)
const PAGE_SIZE = 250;

/**
 * Converts a raw Linear SDK issue into our full normalized LinearIssueData shape.
 * Resolves all async relations in parallel for performance.
 */
async function normalizeIssue(issue: Issue): Promise<LinearIssueData> {
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

export async function pullFromLinear(workspaceProjectId: number) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    const userId = session?.user?.id;
    if (!userId) return { success: false, error: 'Unauthorized' };

    const client = await getLinearClient(userId);
    if (!client) {
      return { success: false, error: 'Linear account not connected' };
    }

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

    if (!project) {
      return { success: false, error: 'Project not found' };
    }

    // Load all existing local tickets indexed by their Linear issue ID
    const existingLocalTickets = await db
      .select()
      .from(workspaceTickets)
      .where(eq(workspaceTickets.workspaceProjectId, project.id));

    const localTicketsMap = new Map(
      existingLocalTickets.map((t) => [t.linearIssueId, t]),
    );

    const seenLinearIssueIds = new Set<string>();
    let added = 0;
    let updated = 0;
    let unchanged = 0;
    let hasNextPage = true;
    let endCursor: string | undefined = undefined;

    // Paginate through all remote issues (up to PAGE_SIZE per request)
    while (hasNextPage) {
      const response = await client.issues({
        filter: { project: { id: { eq: project.linearProjectId } } },
        first: PAGE_SIZE,
        after: endCursor,
      });

      // Normalize all issues on this page in parallel
      const normalizedIssues = await Promise.all(
        response.nodes.map((issue) => normalizeIssue(issue)),
      );

      for (const normalizedData of normalizedIssues) {
        seenLinearIssueIds.add(normalizedData.id);

        const newHash = await computeTicketHash(normalizedData);
        const existingTicket = localTicketsMap.get(normalizedData.id);

        if (!existingTicket) {
          // Brand-new remote issue — insert as synced
          await db.insert(workspaceTickets).values({
            workspaceProjectId: project.id,
            linearIssueId: normalizedData.id,
            linearIdentifier: normalizedData.identifier,
            originalData: normalizedData,
            originalHash: newHash,
            syncStatus: 'synced',
            parentLinearIdentifier: normalizedData.parentIdentifier,
          });
          added++;
        } else if (existingTicket.originalHash !== newHash) {
          // Remote has changed since our last pull
          // If user has local modifications, flag as conflict (remote_updated)
          // If no local modifications, just update silently to synced
          const nextStatus =
            existingTicket.syncStatus === 'modified' ||
            existingTicket.syncStatus === 'new_local'
              ? 'remote_updated'
              : 'synced';

          await db
            .update(workspaceTickets)
            .set({
              originalData: normalizedData,
              originalHash: newHash,
              syncStatus: nextStatus,
              parentLinearIdentifier: normalizedData.parentIdentifier,
              updatedAt: new Date(),
            })
            .where(eq(workspaceTickets.id, existingTicket.id));
          updated++;
        } else {
          unchanged++;
        }
      }

      hasNextPage = response.pageInfo.hasNextPage;
      endCursor = response.pageInfo.endCursor ?? undefined;
    }

    // Detect remote deletions: local tickets with a linearIssueId not returned by the API
    let deleted = 0;
    for (const localTicket of existingLocalTickets) {
      if (
        localTicket.linearIssueId &&
        !seenLinearIssueIds.has(localTicket.linearIssueId) &&
        localTicket.syncStatus !== 'new_local'
      ) {
        await db
          .update(workspaceTickets)
          .set({ syncStatus: 'remote_deleted', updatedAt: new Date() })
          .where(eq(workspaceTickets.id, localTicket.id));
        deleted++;
      }
    }

    // Stamp the last sync time on the project
    await db
      .update(workspaceProjects)
      .set({ lastSyncedAt: new Date(), updatedAt: new Date() })
      .where(eq(workspaceProjects.id, project.id));

    return {
      success: true,
      data: { added, updated, unchanged, deleted },
    };
  } catch (error) {
    console.error('pullFromLinear error:', error);
    return { success: false, error: 'Failed to pull from Linear' };
  }
}
