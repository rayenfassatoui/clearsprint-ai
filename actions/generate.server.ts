'use server';

import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import OpenAI from 'openai';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { projects, ticketHistory, tickets } from '@/lib/db/schema';

const openai = new OpenAI({
  baseURL: process.env.OPENAI_BASE_URL,
  apiKey: process.env.OPENAI_API_KEY,
});

const SubtaskSchema = z.object({
  title: z.string(),
  description: z.string(),
});

const TaskSchema = z.object({
  title: z.string(),
  description: z.string(),
  subtasks: z.array(SubtaskSchema).optional(),
});

const EpicSchema = z.object({
  title: z.string(),
  description: z.string(),
  tasks: z.array(TaskSchema).optional(),
});

const BacklogSchema = z.object({
  epics: z.array(EpicSchema),
});

export async function generateBacklog(projectId: number) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { error: 'Unauthorized' };
  }

  // 1. Fetch Project
  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId));

  if (!project) {
    return { error: 'Project not found' };
  }

  if (!project.rawText) {
    return { error: 'No document text found for this project' };
  }

  // 2. Call OpenAI
  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL_NAME || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a senior product manager. Analyze the provided Product Requirements Document (PRD) text and generate a structured Jira backlog.
          
          Output a JSON object with a list of "epics".
          Each "epic" has a "title", "description", and a list of "tasks".
          Each "task" has a "title", "description", and a list of "subtasks".
          Each "subtask" has a "title" and "description".
          
          Keep descriptions concise but informative.
          Ensure the hierarchy is logical.`,
        },
        {
          role: 'user',
          content: project.rawText.slice(0, 50000), // Truncate if too long, though 50k chars is decent for 4o-mini
        },
      ],
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    const rawJson = JSON.parse(content);
    const backlog = BacklogSchema.parse(rawJson);

    // 3. Insert into DB
    // We'll do this sequentially to maintain order and parent relationships

    // First, clear existing tickets for this project (optional, but good for re-generation)
    await db.delete(tickets).where(eq(tickets.projectId, projectId));

    let epicOrder = 0;
    for (const epic of backlog.epics) {
      const [newEpic] = await db
        .insert(tickets)
        .values({
          projectId: projectId,
          type: 'epic',
          title: epic.title,
          description: epic.description,
          orderIndex: epicOrder++,
        })
        .returning();

      if (epic.tasks) {
        let taskOrder = 0;
        for (const task of epic.tasks) {
          const [newTask] = await db
            .insert(tickets)
            .values({
              projectId: projectId,
              type: 'task',
              title: task.title,
              description: task.description,
              parentId: newEpic.id,
              orderIndex: taskOrder++,
            })
            .returning();

          if (task.subtasks) {
            let subtaskOrder = 0;
            for (const subtask of task.subtasks) {
              await db.insert(tickets).values({
                projectId: projectId,
                type: 'subtask',
                title: subtask.title,
                description: subtask.description,
                parentId: newTask.id,
                orderIndex: subtaskOrder++,
              });
            }
          }
        }
      }
    }

    return { success: true, count: epicOrder };
  } catch (error) {
    console.error('AI Generation Error:', error);
    return {
      error:
        error instanceof Error ? error.message : 'Failed to generate backlog',
    };
  }
}

export async function tweakTicket(ticketId: number, prompt: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { error: 'Unauthorized' };
  }

  // 1. Fetch Ticket
  const [ticket] = await db
    .select()
    .from(tickets)
    .where(eq(tickets.id, ticketId));

  if (!ticket) {
    return { error: 'Ticket not found' };
  }

  // 2. Call OpenAI
  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL_NAME || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a senior product manager. Update the provided Jira ticket based on the user's request.
          
          Output a JSON object with "title" and "description".
          Keep the tone professional and concise.`,
        },
        {
          role: 'user',
          content: `Ticket Title: ${ticket.title}
          Ticket Description: ${ticket.description}
          
          User Request: ${prompt}`,
        },
      ],
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    const rawJson = JSON.parse(content);
    const updatedTicket = z
      .object({
        title: z.string(),
        description: z.string(),
      })
      .parse(rawJson);

    // 3. Update DB
    await db
      .update(tickets)
      .set({
        title: updatedTicket.title,
        description: updatedTicket.description,
      })
      .where(eq(tickets.id, ticketId));

    await db.insert(ticketHistory).values({
      ticketId: ticketId,
      userId: session.user.id,
      changeType: 'ai_tweak',
      previousValue: { title: ticket.title, description: ticket.description },
      newValue: {
        title: updatedTicket.title,
        description: updatedTicket.description,
      },
      prompt: prompt,
    });

    return { success: true };
  } catch (error) {
    console.error('AI Tweak Error:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to tweak ticket',
    };
  }
}
