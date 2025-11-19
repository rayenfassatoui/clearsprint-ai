'use server';

import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { tickets } from '@/lib/db/schema';
import {
  createJiraIssue,
  getJiraProjects,
  getJiraResources,
  getValidJiraToken,
} from '@/lib/jira';

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

export async function pushToJira(
  projectId: number,
  cloudId: string,
  jiraProjectKey: string,
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

    // 1. Fetch all tickets for the project
    // We need to fetch them in a way that preserves hierarchy (Epics -> Tasks -> Subtasks)
    // But for now, let's just fetch all and process them.
    const allTickets = await db
      .select()
      .from(tickets)
      .where(eq(tickets.projectId, projectId));

    const epics = allTickets.filter((t) => t.type === 'epic');

    let pushedCount = 0;

    for (const epic of epics) {
      // Create Epic
      const epicData = {
        fields: {
          project: { key: jiraProjectKey },
          summary: epic.title,
          description: {
            type: 'doc',
            version: 1,
            content: [
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: epic.description || '',
                  },
                ],
              },
            ],
          },
          issuetype: { name: 'Epic' },
        },
      };

      try {
        const epicRes = await createJiraIssue(cloudId, token, epicData);
        // Update DB with Jira ID
        await db
          .update(tickets)
          .set({ jiraId: epicRes.key })
          .where(eq(tickets.id, epic.id));
        pushedCount++;

        // Find children tasks
        const tasks = allTickets.filter(
          (t) => t.parentId === epic.id && t.type === 'task',
        );

        for (const task of tasks) {
          const taskData = {
            fields: {
              project: { key: jiraProjectKey },
              summary: task.title,
              description: {
                type: 'doc',
                version: 1,
                content: [
                  {
                    type: 'paragraph',
                    content: [
                      {
                        type: 'text',
                        text: task.description || '',
                      },
                    ],
                  },
                ],
              },
              issuetype: { name: 'Task' },
              parent: { key: epicRes.key },
            },
          };

          const taskRes = await createJiraIssue(cloudId, token, taskData);
          await db
            .update(tickets)
            .set({ jiraId: taskRes.key })
            .where(eq(tickets.id, task.id));
          pushedCount++;

          // Find subtasks
          const subtasks = allTickets.filter(
            (t) => t.parentId === task.id && t.type === 'subtask',
          );

          for (const subtask of subtasks) {
            const subtaskData = {
              fields: {
                project: { key: jiraProjectKey },
                summary: subtask.title,
                description: {
                  type: 'doc',
                  version: 1,
                  content: [
                    {
                      type: 'paragraph',
                      content: [
                        {
                          type: 'text',
                          text: subtask.description || '',
                        },
                      ],
                    },
                  ],
                },
                issuetype: { name: 'Sub-task' },
                parent: { key: taskRes.key },
              },
            };

            const subtaskRes = await createJiraIssue(
              cloudId,
              token,
              subtaskData,
            );
            await db
              .update(tickets)
              .set({ jiraId: subtaskRes.key })
              .where(eq(tickets.id, subtask.id));
            pushedCount++;
          }
        }
      } catch (err) {
        console.error(`Failed to push epic ${epic.title}`, err);
        // Continue with other epics
      }
    }

    return { success: true, pushedCount };
  } catch (error) {
    console.error('Push to Jira error:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to push to Jira',
    };
  }
}
