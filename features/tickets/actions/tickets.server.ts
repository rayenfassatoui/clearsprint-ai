'use server';

import { asc, eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { tickets } from '@/lib/db/schema';

export async function createTicket(data: {
  projectId: number;
  title: string;
  description?: string;
  type: 'epic' | 'task' | 'subtask';
  parentId?: number | null;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { error: 'Unauthorized' };
  }

  try {
    // Get max order index
    const existing = await db
      .select()
      .from(tickets)
      .where(eq(tickets.projectId, data.projectId));
    const maxOrder = existing.reduce(
      (max, t) => Math.max(max, t.orderIndex || 0),
      0,
    );

    const [newTicket] = await db
      .insert(tickets)
      .values({
        projectId: data.projectId,
        title: data.title,
        description: data.description,
        type: data.type,
        parentId: data.parentId,
        orderIndex: maxOrder + 1000, // Add to end
      })
      .returning();

    return { success: true, ticket: newTicket };
  } catch (error) {
    console.error('Create Ticket Error:', error);
    return { error: 'Failed to create ticket' };
  }
}

export async function getProjectTickets(projectId: number) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { error: 'Unauthorized' };
  }

  try {
    const allTickets = await db
      .select()
      .from(tickets)
      .where(eq(tickets.projectId, projectId))
      .orderBy(asc(tickets.orderIndex));

    return { success: true, tickets: allTickets };
  } catch (error) {
    console.error('Fetch Tickets Error:', error);
    return { error: 'Failed to fetch tickets' };
  }
}

export async function updateTicketOrder(
  updates: { id: number; parentId: number | null; orderIndex: number }[],
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { error: 'Unauthorized' };
  }

  try {
    // Process updates in a transaction or batch if possible, but loop is fine for now
    // Drizzle doesn't have a bulk update with different values easily yet without raw SQL
    for (const update of updates) {
      await db
        .update(tickets)
        .set({
          parentId: update.parentId,
          orderIndex: update.orderIndex,
        })
        .where(eq(tickets.id, update.id));
    }

    return { success: true };
  } catch (error) {
    console.error('Update Order Error:', error);
    return { error: 'Failed to update ticket order' };
  }
}

export async function updateTicket(
  ticketId: number,
  data: {
    title?: string;
    description?: string;
    type?: 'epic' | 'task' | 'subtask';
  },
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { error: 'Unauthorized' };
  }

  try {
    await db.update(tickets).set(data).where(eq(tickets.id, ticketId));
    return { success: true };
  } catch (error) {
    console.error('Update Ticket Error:', error);
    return { error: 'Failed to update ticket' };
  }
}

export async function deleteTicket(ticketId: number) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { error: 'Unauthorized' };
  }

  try {
    // Delete children first? Or rely on cascade if configured (we didn't configure cascade in schema explicitly)
    // Let's do a recursive delete or just delete the ticket and let orphans be orphans for now?
    // Better to delete children.

    // Find children
    const children = await db
      .select()
      .from(tickets)
      .where(eq(tickets.parentId, ticketId));
    for (const child of children) {
      await deleteTicket(child.id);
    }

    await db.delete(tickets).where(eq(tickets.id, ticketId));
    return { success: true };
  } catch (error) {
    console.error('Delete Ticket Error:', error);
    return { error: 'Failed to delete ticket' };
  }
}
