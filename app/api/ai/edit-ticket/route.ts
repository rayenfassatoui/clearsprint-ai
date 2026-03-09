import { NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { TicketUpdateSchema } from '@/features/linear-sync/types';

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { ticketData, prompt } = await req.json();

    if (!ticketData || !prompt) {
      return NextResponse.json(
        { error: 'Missing ticketData or prompt' },
        { status: 400 },
      );
    }

    const { object } = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: TicketUpdateSchema,
      prompt: `You are a senior project manager editing Linear tickets. 
Only modify the fields the user asks about or implies.
Return the complete ticket details as requested. Do not delete data that wasn't requested to change.
If the status should be changed to 'Done', 'In Progress', etc, ensure it matches linear workflow states.

Original Ticket Data:
${JSON.stringify(ticketData, null, 2)}

User Request:
${prompt}`,
    });

    return NextResponse.json({ success: true, data: object });
  } catch (err: any) {
    console.error('AI Edit Ticket Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to edit ticket' },
      { status: 500 },
    );
  }
}
