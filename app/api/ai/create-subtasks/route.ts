import { NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/lib/db';
import { workspaceTickets } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { TicketCreateSchema } from '@/features/linear-sync/types';

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { parentTicketId, prompt } = await req.json();

    if (!parentTicketId || !prompt) {
      return NextResponse.json(
        { error: 'Missing parentTicketId or prompt' },
        { status: 400 },
      );
    }

    const [parentTicket] = await db
      .select()
      .from(workspaceTickets)
      .where(eq(workspaceTickets.id, parentTicketId))
      .limit(1);

    if (!parentTicket) {
      return NextResponse.json(
        { error: 'Parent ticket not found' },
        { status: 404 },
      );
    }

    const parentData = {
      ...(parentTicket.originalData as any),
      ...(parentTicket.draftData as any),
    };

    const { object } = await generateObject({
      model: openai(process.env.OPENAI_MODEL_NAME || 'gpt-4o-mini'),
      schema: z.object({
        subtasks: z.array(TicketCreateSchema),
      }),
      prompt: `You are creating sub-tasks for a Linear issue based on the user request.
Context of Parent Ticket:
${JSON.stringify({ title: parentData.title, description: parentData.description }, null, 2)}

User Request:
${prompt}

Generate a concise list of logically separated subtasks.`,
    });

    // Create the DB entries
    const newTickets = await Promise.all(
      object.subtasks.map(async (sub) => {
        const draftPayload = {
          title: sub.title,
          description: sub.description || '',
          statusName: sub.statusName || 'Todo',
          priority: sub.priority || 0,
          labels: sub.labels || [],
        };

        const [created] = await db
          .insert(workspaceTickets)
          .values({
            workspaceProjectId: parentTicket.workspaceProjectId,
            parentLinearIdentifier: parentTicket.linearIdentifier,
            linearIssueId: null,
            linearIdentifier: null, // Because it's a new local ticket
            originalData: null,
            draftData: draftPayload,
            syncStatus: 'new_local',
          })
          .returning();
        return created;
      }),
    );

    return NextResponse.json({
      success: true,
      count: newTickets.length,
      data: newTickets,
    });
  } catch (err: any) {
    console.error('AI Create Subtasks Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to create subtasks' },
      { status: 500 },
    );
  }
}
