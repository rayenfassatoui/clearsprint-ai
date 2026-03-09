'use server';

import { db } from '@/lib/db';
import { account, workspaceProjects } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import type { ActionResponse } from '@/lib/types';
import { revalidatePath } from 'next/cache';

export async function disconnectLinearAccount(): Promise<ActionResponse> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // Delete the account connection
    await db
      .delete(account)
      .where(
        and(
          eq(account.userId, session.user.id),
          eq(account.providerId, 'linear'),
        ),
      );

    // Delete all workspace projects (and by cascade, tickets) associated with this user
    await db
      .delete(workspaceProjects)
      .where(eq(workspaceProjects.userId, session.user.id));

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Failed to disconnect Linear:', error);
    return { success: false, error: 'Failed to disconnect Linear account' };
  }
}
