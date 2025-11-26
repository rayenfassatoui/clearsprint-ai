'use server';

import { eq, and } from 'drizzle-orm';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { tickets, projects } from '@/lib/db/schema';
import type { JiraIssueUpdateData } from '@/types';
import type { SyncChange } from '../types';
import {
  createJiraIssue,
  getJiraIssue,
  getJiraIssues,
  getJiraProjects,
  getJiraResources,
  getValidJiraToken,
  updateJiraIssue,
  getJiraProjectDetails,
} from '@/lib/jira';

function extractDescription(description: any): string {
  if (!description || typeof description !== 'object') return '';
  if (description.type !== 'doc') return '';

  let text = '';
  if (description.content) {
    description.content.forEach((node: any) => {
      if (node.type === 'paragraph' && node.content) {
        text += node.content.map((n: any) => n.text || '').join('') + '\n\n';
      }
    });
  }
  return text.trim();
}

function mapJiraType(issueType: string): 'epic' | 'task' | 'subtask' {
  const lower = issueType.toLowerCase();
  if (lower === 'epic') return 'epic';
  if (lower === 'sub-task' || lower === 'subtask') return 'subtask';
  return 'task';
}

export async function getJiraSites() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { error: 'Unauthorized' };
  }

  try {
    const token = await getValidJiraToken(session.user.id);
    if (!token) return { error: 'Could not retrieve Jira token' };

    const resources = await getJiraResources(token);
    return { success: true, resources };
  } catch (error) {
    console.error('Jira sites error:', error);
    return {
      error:
        error instanceof Error ? error.message : 'Failed to fetch Jira sites',
    };
  }
}

export async function getJiraProjectsList(cloudId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { error: 'Unauthorized' };
  }

  try {
    const token = await getValidJiraToken(session.user.id);
    if (!token) return { error: 'Could not retrieve Jira token' };

    const projects = await getJiraProjects(cloudId, token);
    return { success: true, projects };
  } catch (error) {
    console.error('Jira projects error:', error);
    return {
      error:
        error instanceof Error
          ? error.message
          : 'Failed to fetch Jira projects',
    };
  }
}

// Helper to get issue types map
async function getIssueTypesMap(
  cloudId: string,
  token: string,
  jiraProjectKey: string
) {
  const projectDetails = await getJiraProjectDetails(
    cloudId,
    token,
    jiraProjectKey
  );
  const issueTypes = projectDetails.issueTypes || [];

  const findIssueTypeId = (type: 'epic' | 'task' | 'subtask') => {
    const normalized = type.toLowerCase();
    const match = issueTypes.find((it: any) => {
      const itName = it.name.toLowerCase();
      if (normalized === 'epic') return itName === 'epic';
      if (normalized === 'subtask') return it.subtask;
      if (normalized === 'task') {
        return !it.subtask && itName !== 'epic';
      }
      return false;
    });

    if (normalized === 'task' && match && match.name.toLowerCase() !== 'task') {
      const exactTask = issueTypes.find(
        (it: any) => it.name.toLowerCase() === 'task'
      );
      if (exactTask) return exactTask;
    }

    return match;
  };

  return {
    epic: findIssueTypeId('epic'),
    task: findIssueTypeId('task'),
    subtask: findIssueTypeId('subtask'),
  };
}

export async function getSyncPreview(
  projectId: number,
  cloudId: string,
  jiraProjectKey: string
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { error: 'Unauthorized' };
  }

  try {
    const token = await getValidJiraToken(session.user.id);
    if (!token) return { error: 'Could not retrieve Jira token' };

    const allTickets = await db
      .select()
      .from(tickets)
      .where(eq(tickets.projectId, projectId));

    const changes: SyncChange[] = [];
    const activeJiraKeys = new Set<string>();

    // 1. Check local tickets against Jira
    for (const ticket of allTickets) {
      if (ticket.jiraId) {
        activeJiraKeys.add(ticket.jiraId);
        // Check if needs update
        try {
          const jiraIssue = await getJiraIssue(cloudId, token, ticket.jiraId);
          const jiraSummary = jiraIssue.fields.summary;
          // const jiraDesc = extractDescription(jiraIssue.fields.description);

          const diff = [];
          if (jiraSummary !== ticket.title) {
            diff.push({
              field: 'title',
              oldValue: jiraSummary,
              newValue: ticket.title || '',
            });
          }
          // Simple description check (might need more robust comparison due to formatting)
          // For now, let's assume if they are different strings, they are different.
          // But Jira doc format vs plain text is hard.
          // We'll skip description diffing for V1 to avoid false positives,
          // OR we just push if title changed OR if we want to force push.
          // Let's just check title for now to be safe, or maybe length?
          // actually, let's just push updates if title differs.

          if (diff.length > 0) {
            changes.push({
              id: `update-${ticket.id}`,
              ticketId: ticket.id,
              title: ticket.title || 'Untitled',
              changeType: 'update',
              jiraId: ticket.jiraId,
              diff,
            });
          }
        } catch (_) {
          // If 404, it means it was deleted in Jira?
          // Or we just can't find it. We should probably re-create it?
          // For now, let's assume we re-create.
          changes.push({
            id: `create-${ticket.id}`,
            ticketId: ticket.id,
            title: ticket.title || 'Untitled',
            changeType: 'create',
          });
        }
      } else {
        // New ticket
        changes.push({
          id: `create-${ticket.id}`,
          ticketId: ticket.id,
          title: ticket.title || 'Untitled',
          changeType: 'create',
        });
      }
    }

    // 2. Check for soft deletes (Jira issues not in local)
    // Fetch all Jira issues for project
    let allJiraIssues: any[] = [];
    let nextPageToken: string | undefined = undefined;
    do {
      const jql = `project = "${jiraProjectKey}"`;
      const res = await getJiraIssues(cloudId, token, jql, 100, nextPageToken);
      if (res.issues) {
        allJiraIssues = [...allJiraIssues, ...res.issues];
      }
      nextPageToken = res.nextPageToken;
    } while (nextPageToken);

    for (const issue of allJiraIssues) {
      if (!activeJiraKeys.has(issue.key)) {
        if (!issue.fields.summary.endsWith(' [DELETED]')) {
          changes.push({
            id: `soft-delete-${issue.key}`,
            ticketId: 0, // No local ticket
            title: issue.fields.summary,
            changeType: 'soft_delete',
            jiraId: issue.key,
          });
        }
      }
    }

    return {
      success: true,
      preview: {
        changes,
        summary: {
          toCreate: changes.filter((c) => c.changeType === 'create').length,
          toUpdate: changes.filter((c) => c.changeType === 'update').length,
          toDelete: changes.filter((c) => c.changeType === 'soft_delete')
            .length,
        },
      },
    };
  } catch (error) {
    console.error('Get sync preview error:', error);
    return {
      error:
        error instanceof Error ? error.message : 'Failed to get sync preview',
    };
  }
}

export async function executeSync(
  projectId: number,
  cloudId: string,
  jiraProjectKey: string,
  changes: SyncChange[]
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { error: 'Unauthorized' };
  }

  try {
    const token = await getValidJiraToken(session.user.id);
    if (!token) return { error: 'Could not retrieve Jira token' };

    const typeMap = await getIssueTypesMap(cloudId, token, jiraProjectKey);
    let syncedCount = 0;

    // Helper to construct Jira issue data
    const getIssueData = (ticket: any, parentKey?: string) => {
      const issueData: any = {
        fields: {
          project: { key: jiraProjectKey },
          summary: ticket.title,
          description: {
            type: 'doc',
            version: 1,
            content: [
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: ticket.description || '',
                  },
                ],
              },
            ],
          },
          issuetype: {
            id:
              ticket.type === 'epic'
                ? typeMap.epic?.id
                : ticket.type === 'subtask'
                ? typeMap.subtask?.id
                : typeMap.task?.id,
          },
        },
      };

      if (parentKey) {
        issueData.fields.parent = { key: parentKey };
      }
      return issueData;
    };

    // We need to process in order: Epics -> Tasks -> Subtasks
    // But 'changes' might be mixed.
    // Also we need to fetch the actual ticket data for creates/updates because 'changes' only has minimal info.

    // 1. Fetch all tickets involved
    const ticketIds = changes
      .filter((c) => c.changeType === 'create' || c.changeType === 'update')
      .map((c) => c.ticketId);

    const ticketsMap = new Map<number, typeof tickets.$inferSelect>();
    if (ticketIds.length > 0) {
      const fetched = await db
        .select()
        .from(tickets)
        .where(and(eq(tickets.projectId, projectId))); // Fetch all to be safe for parents
      for (const t of fetched) {
        ticketsMap.set(t.id, t);
      }
    }

    // Helper to get parent Jira Key
    const getParentKey = (ticket: typeof tickets.$inferSelect) => {
      if (!ticket.parentId) return undefined;
      const parent = ticketsMap.get(ticket.parentId);
      return parent?.jiraId || undefined;
    };

    // Process Creates/Updates
    // Sort by type priority: Epic -> Task -> Subtask
    const processOrder = (c: SyncChange) => {
      const t = ticketsMap.get(c.ticketId);
      if (!t) return 999;
      if (t.type === 'epic') return 1;
      if (t.type === 'task') return 2;
      if (t.type === 'subtask') return 3;
      return 10;
    };

    const sortedChanges = changes
      .filter((c) => c.changeType !== 'soft_delete')
      .sort((a, b) => processOrder(a) - processOrder(b));

    for (const change of sortedChanges) {
      const ticket = ticketsMap.get(change.ticketId);
      if (!ticket) continue;

      if (change.changeType === 'create') {
        const parentKey = getParentKey(ticket);
        const data = getIssueData(ticket, parentKey);

        // Check if exists by title (safety check)
        // ... (Skipping for now to trust the preview, but maybe good to have?)

        const res = await createJiraIssue(cloudId, token, data);
        await db
          .update(tickets)
          .set({ jiraId: res.key })
          .where(eq(tickets.id, ticket.id));
        // Update map for children
        ticket.jiraId = res.key;
        ticketsMap.set(ticket.id, ticket);
        syncedCount++;
      } else if (change.changeType === 'update' && ticket.jiraId) {
        const jiraId = ticket.jiraId;
        const data = getIssueData(ticket as typeof tickets.$inferSelect);
        // Don't update parent for now as moving tickets is complex
        delete data.fields.parent;

        await updateJiraIssue(cloudId, token, jiraId, data);
        syncedCount++;
      }
    }

    // Process Soft Deletes
    const deleteChanges = changes.filter((c) => c.changeType === 'soft_delete');
    for (const change of deleteChanges) {
      if (change.jiraId) {
        await updateJiraIssue(cloudId, token, change.jiraId, {
          fields: {
            summary: `${change.title} [DELETED]`,
          },
        });
        syncedCount++;
      }
    }

    return { success: true, syncedCount };
  } catch (error) {
    console.error('Execute sync error:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to execute sync',
    };
  }
}

export async function importFromJira(
  projectId: number,
  cloudId: string,
  jiraProjectKey: string
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { error: 'Unauthorized' };
  }

  try {
    const token = await getValidJiraToken(session.user.id);
    if (!token) return { error: 'Could not retrieve Jira token' };

    // Fetch all issues for the project
    // Note: maxResults is 100 for now, might need pagination loop for large projects
    const jql = `project = "${jiraProjectKey}"`;
    const res = await getJiraIssues(cloudId, token, jql, 100);
    const issues: any[] = res.issues || [];

    let importedCount = 0;
    const jiraKeyToLocalId = new Map<string, number>();

    // Helper to upsert ticket
    const upsertTicket = async (
      issue: any,
      type: 'epic' | 'task' | 'subtask',
      parentId?: number
    ) => {
      // 1. Try to find by Jira ID (Key)
      let existing = await db
        .select()
        .from(tickets)
        .where(
          and(eq(tickets.projectId, projectId), eq(tickets.jiraId, issue.key))
        )
        .limit(1);

      // 2. Fallback: Try to find by Title and Type if not found by Jira ID
      // This handles cases where tickets were created locally or link was lost
      if (existing.length === 0) {
        existing = await db
          .select()
          .from(tickets)
          .where(
            and(
              eq(tickets.projectId, projectId),
              eq(tickets.title, issue.fields.summary),
              eq(tickets.type, type)
            )
          )
          .limit(1);
      }

      const description = extractDescription(issue.fields.description);
      const title = issue.fields.summary;

      if (existing.length > 0) {
        // Update existing ticket
        await db
          .update(tickets)
          .set({
            title,
            description,
            type,
            parentId: parentId || null,
            jiraId: issue.key, // Ensure Jira ID is linked
          })
          .where(eq(tickets.id, existing[0].id));
        jiraKeyToLocalId.set(issue.key, existing[0].id);
      } else {
        // Insert new ticket
        const [newTicket] = await db
          .insert(tickets)
          .values({
            projectId,
            type,
            title,
            description,
            parentId: parentId || null,
            jiraId: issue.key,
            orderIndex: 0, // Default
          })
          .returning();
        jiraKeyToLocalId.set(issue.key, newTicket.id);
      }
      importedCount++;
    };

    // 1. Process Epics
    const epics = issues.filter(
      (i: any) => mapJiraType(i.fields.issuetype.name) === 'epic'
    );
    for (const epic of epics) {
      await upsertTicket(epic, 'epic');
    }

    // 2. Process Tasks (Standard issues)
    const tasks = issues.filter((i: any) => {
      const type = mapJiraType(i.fields.issuetype.name);
      return type === 'task';
    });

    for (const task of tasks) {
      let parentId: number | undefined;
      // Try to find parent epic
      if (task.fields.parent) {
        parentId = jiraKeyToLocalId.get(task.fields.parent.key);
      }
      await upsertTicket(task, 'task', parentId);
    }

    // 3. Process Subtasks
    const subtasks = issues.filter(
      (i: any) => mapJiraType(i.fields.issuetype.name) === 'subtask'
    );
    for (const subtask of subtasks) {
      let parentId: number | undefined;
      if (subtask.fields.parent) {
        parentId = jiraKeyToLocalId.get(subtask.fields.parent.key);
      }
      await upsertTicket(subtask, 'subtask', parentId);
    }

    return { success: true, importedCount };
  } catch (error) {
    console.error('Import from Jira error:', error);
    return {
      error:
        error instanceof Error ? error.message : 'Failed to import from Jira',
    };
  }
}

/**
 * Get Jira issues (work items) for a specific cloud/site
 * Optionally filter with JQL
 */
export async function getJiraIssuesList(
  cloudId: string,
  jql?: string,
  maxResults = 50,
  nextPageToken?: string
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { error: 'Unauthorized' };
  }

  try {
    const token = await getValidJiraToken(session.user.id);
    if (!token) return { error: 'Could not retrieve Jira token' };

    const result = await getJiraIssues(
      cloudId,
      token,
      jql,
      maxResults,
      nextPageToken
    );
    return { success: true, ...result };
  } catch (error) {
    console.error('Jira issues error:', error);
    return {
      error:
        error instanceof Error ? error.message : 'Failed to fetch Jira issues',
    };
  }
}

/**
 * Get a single Jira issue by key or ID
 */
export async function getSingleJiraIssue(
  cloudId: string,
  issueIdOrKey: string
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { error: 'Unauthorized' };
  }

  try {
    const token = await getValidJiraToken(session.user.id);
    if (!token) return { error: 'Could not retrieve Jira token' };

    const issue = await getJiraIssue(cloudId, token, issueIdOrKey);
    return { success: true, issue };
  } catch (error) {
    console.error('Jira issue error:', error);
    return {
      error:
        error instanceof Error ? error.message : 'Failed to fetch Jira issue',
    };
  }
}

/**
 * Update a Jira issue
 */
export async function updateJiraIssueAction(
  cloudId: string,
  issueIdOrKey: string,
  updateData: JiraIssueUpdateData
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { error: 'Unauthorized' };
  }

  try {
    const token = await getValidJiraToken(session.user.id);
    if (!token) return { error: 'Could not retrieve Jira token' };

    const result = await updateJiraIssue(
      cloudId,
      token,
      issueIdOrKey,
      updateData
    );
    return { success: true, ...result };
  } catch (error) {
    console.error('Update Jira issue error:', error);
    return {
      error:
        error instanceof Error ? error.message : 'Failed to update Jira issue',
    };
  }
}

export async function createProjectFromJira(
  cloudId: string,
  jiraProjectKey: string,
  projectName: string
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { error: 'Unauthorized' };
  }

  try {
    // Create project
    const [newProject] = await db
      .insert(projects)
      .values({
        userId: session.user.id,
        name: projectName,
        jiraProjectKey: jiraProjectKey,
        // docUrl and rawText are empty for imported projects
      })
      .returning();

    // Import tickets
    const importResult = await importFromJira(
      newProject.id,
      cloudId,
      jiraProjectKey
    );

    if (importResult.error) {
      return { error: importResult.error, projectId: newProject.id };
    }

    return { success: true, projectId: newProject.id };
  } catch (error) {
    console.error('Create project from Jira error:', error);
    return {
      error:
        error instanceof Error
          ? error.message
          : 'Failed to create project from Jira',
    };
  }
}
