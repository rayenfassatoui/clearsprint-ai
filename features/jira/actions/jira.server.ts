'use server';

import { eq, and } from 'drizzle-orm';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { tickets, projects } from '@/lib/db/schema';
import type { JiraIssueUpdateData } from '@/types';
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

export async function syncToJira(
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

    // Fetch project details to get valid issue types
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
        // For task, find a non-subtask, non-epic type. Prefer 'Task' if available.
        if (normalized === 'task') {
          return !it.subtask && itName !== 'epic';
        }
        return false;
      });

      // If we have multiple matches for 'task' (e.g. Task, Bug, Story), try to find exact 'Task' first
      if (
        normalized === 'task' &&
        match &&
        match.name.toLowerCase() !== 'task'
      ) {
        const exactTask = issueTypes.find(
          (it: any) => it.name.toLowerCase() === 'task'
        );
        if (exactTask) return exactTask;
      }

      return match;
    };

    const epicType = findIssueTypeId('epic');
    const taskType = findIssueTypeId('task');
    const subtaskType = findIssueTypeId('subtask');

    if (!epicType || !taskType || !subtaskType) {
      console.warn('Could not map all issue types', {
        epicType,
        taskType,
        subtaskType,
      });
      // We continue, but some tickets might fail if type is missing
    }

    let syncedCount = 0;

    // Sort by hierarchy to ensure parents exist before children
    const epics = allTickets.filter((t) => t.type === 'epic');
    const tasks = allTickets.filter((t) => t.type === 'task');
    const subtasks = allTickets.filter((t) => t.type === 'subtask');

    // Track all active Jira keys (initially from DB)
    const activeJiraKeys = new Set<string>();
    allTickets.forEach((t) => {
      if (t.jiraId) activeJiraKeys.add(t.jiraId);
    });

    const processTicket = async (
      ticket: typeof tickets.$inferSelect,
      parentJiraKey?: string
    ) => {
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
                ? epicType?.id
                : ticket.type === 'subtask'
                ? subtaskType?.id
                : taskType?.id,
          },
        },
      };

      if (parentJiraKey) {
        issueData.fields.parent = { key: parentJiraKey };
      }

      try {
        if (ticket.jiraId) {
          // Update existing
          await updateJiraIssue(cloudId, token, ticket.jiraId, issueData);
          syncedCount++;
          return ticket.jiraId;
        } else {
          // Check if issue already exists in Jira (by title and type) to prevent duplicates
          // Escape quotes in title for JQL
          const title = ticket.title || 'Untitled';
          const safeTitle = title.replace(/"/g, '\\"');
          // Use issue type ID for creation, but for JQL we need name.
          // Note: JQL issuetype = ID is also valid and safer!
          const typeId = issueData.fields.issuetype.id;
          const jql = `project = "${jiraProjectKey}" AND summary ~ "\\"${safeTitle}\\"" AND issuetype = ${typeId}`;

          const existingRes = await getJiraIssues(cloudId, token, jql, 1);

          if (existingRes.issues && existingRes.issues.length > 0) {
            // Found existing issue, link to it and update
            const existingIssue = existingRes.issues[0];
            // Double check exact title match because JQL ~ operator is fuzzy/contains
            if (existingIssue.fields.summary === ticket.title) {
              await updateJiraIssue(
                cloudId,
                token,
                existingIssue.key,
                issueData
              );
              await db
                .update(tickets)
                .set({ jiraId: existingIssue.key })
                .where(eq(tickets.id, ticket.id));
              syncedCount++;
              activeJiraKeys.add(existingIssue.key); // Add to active set
              return existingIssue.key;
            }
          }

          // Create new if not found
          const res = await createJiraIssue(cloudId, token, issueData);
          await db
            .update(tickets)
            .set({ jiraId: res.key })
            .where(eq(tickets.id, ticket.id));
          syncedCount++;
          activeJiraKeys.add(res.key); // Add to active set
          return res.key;
        }
      } catch (err) {
        console.error(`Failed to sync ticket ${ticket.title}`, err);
        return null;
      }
    };

    // 1. Sync Epics
    const epicMap = new Map<number, string>(); // localId -> jiraKey
    for (const epic of epics) {
      const key = await processTicket(epic);
      if (key) epicMap.set(epic.id, key);
    }

    // 2. Sync Tasks
    const taskMap = new Map<number, string>();
    for (const task of tasks) {
      let parentKey;
      if (task.parentId && epicMap.has(task.parentId)) {
        parentKey = epicMap.get(task.parentId);
      }
      const key = await processTicket(task, parentKey);
      if (key) taskMap.set(task.id, key);
    }

    // 3. Sync Subtasks
    for (const subtask of subtasks) {
      let parentKey;
      if (subtask.parentId && taskMap.has(subtask.parentId)) {
        parentKey = taskMap.get(subtask.parentId);
      }
      await processTicket(subtask, parentKey);
    }

    // 4. Soft Delete Sync: Mark orphaned Jira issues as [DELETED]
    try {
      // Fetch all issues for the project to check for deletions
      // We need to paginate to get ALL issues
      let allJiraIssues: any[] = [];
      let nextPageToken: string | undefined = undefined;

      do {
        const jql = `project = "${jiraProjectKey}"`;
        const res = await getJiraIssues(
          cloudId,
          token,
          jql,
          100,
          nextPageToken
        );
        if (res.issues) {
          allJiraIssues = [...allJiraIssues, ...res.issues];
        }
        nextPageToken = res.nextPageToken;
      } while (nextPageToken);

      for (const issue of allJiraIssues) {
        // If issue is NOT in activeJiraKeys, it means it was deleted locally (or never existed locally but is in Jira)
        if (!activeJiraKeys.has(issue.key)) {
          const currentSummary = issue.fields.summary;
          // Avoid double marking
          if (!currentSummary.endsWith(' [DELETED]')) {
            console.log(`Marking issue ${issue.key} as [DELETED]`);
            await updateJiraIssue(cloudId, token, issue.key, {
              fields: {
                summary: `${currentSummary} [DELETED]`,
              },
            });
          }
        }
      }
    } catch (deleteError) {
      console.error('Soft delete sync error:', deleteError);
      // Don't fail the whole sync if soft delete fails
    }

    return { success: true, syncedCount };
  } catch (error) {
    console.error('Sync to Jira error:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to sync to Jira',
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
    const issues = res.issues || [];

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
      let parentId;
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
      let parentId;
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
