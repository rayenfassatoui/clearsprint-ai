import { LinearClient } from '@linear/sdk';
import { eq, and } from 'drizzle-orm';
import { db } from '@/lib/db';
import { account } from '@/lib/db/schema';

export async function getLinearClient(
  userId: string,
): Promise<LinearClient | null> {
  const [linearAccount] = await db
    .select()
    .from(account)
    .where(and(eq(account.userId, userId), eq(account.providerId, 'linear')));

  if (!linearAccount) {
    return null;
  }

  // Check if token is expired (or close to expiring, e.g. within 5 minutes)
  const isExpired =
    linearAccount.accessTokenExpiresAt &&
    new Date(linearAccount.accessTokenExpiresAt).getTime() <
      Date.now() + 5 * 60 * 1000;

  let accessToken = linearAccount.accessToken;

  if (isExpired && linearAccount.refreshToken) {
    // Attempt to refresh the token
    const response = await fetch('https://api.linear.app/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.LINEAR_CLIENT_ID || '',
        client_secret: process.env.LINEAR_CLIENT_SECRET || '',
        grant_type: 'refresh_token',
        refresh_token: linearAccount.refreshToken,
      }).toString(),
    });

    if (response.ok) {
      const data = await response.json();
      accessToken = data.access_token;

      const expiresIn = data.expires_in; // in seconds
      const newValidUntil = new Date(Date.now() + expiresIn * 1000);

      await db
        .update(account)
        .set({
          accessToken: accessToken,
          refreshToken: data.refresh_token || linearAccount.refreshToken,
          accessTokenExpiresAt: newValidUntil,
        })
        .where(eq(account.id, linearAccount.id));
    } else {
      console.error('Failed to refresh Linear token:', await response.text());
      return null;
    }
  }

  if (!accessToken) {
    return null;
  }

  return new LinearClient({ accessToken });
}
