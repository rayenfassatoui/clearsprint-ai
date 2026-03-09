'use server';

import { headers } from 'next/headers';
import { auth } from '@/lib/auth';

import { db } from '@/lib/db';
import { account } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function checkLinearConnectionStatus() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { connected: false };
  }

  const [linearAccount] = await db
    .select()
    .from(account)
    .where(
      and(
        eq(account.userId, session.user.id),
        eq(account.providerId, 'linear'),
      ),
    )
    .limit(1);

  return { connected: !!linearAccount };
}
