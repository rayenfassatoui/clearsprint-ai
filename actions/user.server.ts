'use server';

import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { getJiraAccount } from '@/lib/jira';

export async function checkJiraConnectionStatus() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { connected: false };
  }

  try {
    const account = await getJiraAccount(session.user.id);
    return { connected: !!account };
  } catch (error) {
    return { connected: false };
  }
}
