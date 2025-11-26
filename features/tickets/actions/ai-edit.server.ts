'use server';

import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import OpenAI from 'openai';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { ticketHistory, tickets } from '@/lib/db/schema';

const openai = new OpenAI({
  baseURL: process.env.OPENAI_BASE_URL,
  apiKey: process.env.OPENAI_API_KEY,
});

const RefinedTicketSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
});

const RefinementSchema = z.object({
  tickets: z.array(RefinedTicketSchema),
});

export async function refineBacklog(projectId: number, instruction: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { error: 'Unauthorized' };
  }

  // 1. Fetch all tickets
  const allTickets = await db
    .select()
    .from(tickets)
    .where(eq(tickets.projectId, projectId));

  if (allTickets.length === 0) {
    return { error: 'No tickets found to refine' };
  }

  // 2. Call OpenAI
  try {
    const systemPrompt = `You are a senior product manager. Your task is to refine the provided backlog tickets based STRICTLY on the user's instruction.
    
    User Instruction: "${instruction}"
    
    Input: A list of tickets with ID, Title, and Description.
    Output: A JSON object with a list of "tickets". Each ticket must have "id" (unchanged), "title", and "description".
    
    CRITICAL RULES:
    1. Do NOT add or remove tickets.
    2. ONLY modify the fields (title/description) that the user explicitly asked to change. If the user only asked to change titles, keep descriptions exactly as they are.
    3. If the user asked to add something (e.g., acceptance criteria), append it to the existing description. Do not rewrite the whole description unless asked.
    4. Maintain the original intent of the ticket.
    5. Do not change the ID.`;

    const inputData = allTickets.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
    }));

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL_NAME || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: JSON.stringify(inputData),
        },
      ],
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    const rawJson = JSON.parse(content);
    const result = RefinementSchema.parse(rawJson);

    // 3. Update DB
    let updatedCount = 0;
    for (const refined of result.tickets) {
      const original = allTickets.find((t) => t.id === refined.id);
      if (original) {
        // Only update if changed
        if (
          original.title !== refined.title ||
          original.description !== refined.description
        ) {
          await db
            .update(tickets)
            .set({
              title: refined.title,
              description: refined.description,
            })
            .where(eq(tickets.id, refined.id));

          await db.insert(ticketHistory).values({
            ticketId: refined.id,
            userId: session.user.id,
            changeType: 'ai_tweak',
            previousValue: {
              title: original.title,
              description: original.description,
            },
            newValue: {
              title: refined.title,
              description: refined.description,
            },
            prompt: instruction,
          });
          updatedCount++;
        }
      }
    }

    return { success: true, updatedCount };
  } catch (error) {
    console.error('Refine Backlog Error:', error);
    return {
      error:
        error instanceof Error ? error.message : 'Failed to refine backlog',
    };
  }
}
