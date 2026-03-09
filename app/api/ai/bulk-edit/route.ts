import { NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/lib/db';
import { workspaceTickets } from '@/lib/db/schema';
import { inArray } from 'drizzle-orm';
import { TicketUpdateSchema } from '@/features/linear-sync/types';

export const maxDuration = 60; // Allow more time for bulk edits

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { ticketIds, prompt } = await req.json();

    if (!Array.isArray(ticketIds) || ticketIds.length === 0 || !prompt) {
      return NextResponse.json(
        { error: 'Missing requirements' },
        { status: 400 },
      );
    }

    const tickets = await db
      .select({
        id: workspaceTickets.id,
        identifier: workspaceTickets.linearIdentifier,
        originalData: workspaceTickets.originalData,
        draftData: workspaceTickets.draftData,
        syncStatus: workspaceTickets.syncStatus,
      })
      .from(workspaceTickets)
      .where(inArray(workspaceTickets.id, ticketIds));

    // Create a streaming response
    const stream = new ReadableStream({
      async start(controller) {
        let updated = 0;
        let failed = 0;
        const errors = [];

        const sendEvent = (eventData: any) => {
          controller.enqueue(
            new TextEncoder().encode(`data: ${JSON.stringify(eventData)}\n\n`),
          );
        };

        sendEvent({ type: 'start', total: tickets.length });

        for (const ticket of tickets) {
          try {
            const currentData = {
              ...(ticket.originalData as any),
              ...(ticket.draftData as any),
            };

            sendEvent({
              type: 'progress',
              ticketId: ticket.id,
              status: 'processing',
            });

            const { object } = await generateObject({
              model: openai('gpt-4o-mini'),
              schema: TicketUpdateSchema,
              prompt: `Bulk edit operation. You are editing Linear tickets.
Only modify fields requested by the user. If the user request does not apply to this ticket, return empty or unmodified fields.

Ticket Context:
${JSON.stringify({ identifier: ticket.identifier, ...currentData }, null, 2)}

User Request:
${prompt}`,
            });

            // Update DB with draft
            const newDraftData = {
              ...((ticket.draftData as any) || {}),
              ...object,
            };

            const nextStatus =
              ticket.syncStatus === 'synced' ? 'modified' : ticket.syncStatus;

            await db
              .update(workspaceTickets)
              .set({
                draftData: newDraftData,
                syncStatus: nextStatus as any,
                updatedAt: new Date(),
              })
              .where(inArray(workspaceTickets.id, [ticket.id]));

            updated++;
            sendEvent({
              type: 'progress',
              ticketId: ticket.id,
              status: 'success',
              data: newDraftData,
            });
          } catch (err: any) {
            failed++;
            errors.push({ ticketId: ticket.id, message: err.message });
            sendEvent({
              type: 'progress',
              ticketId: ticket.id,
              status: 'error',
              error: err.message,
            });
          }
        }

        sendEvent({ type: 'done', updated, failed, errors });
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
  } catch (err: any) {
    console.error('Bulk Edit Ticket Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed' },
      { status: 500 },
    );
  }
}
