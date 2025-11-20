import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { account } from '@/lib/db/schema';
import type { JiraIssueData, JiraIssueUpdateData } from '@/types';

const ATLASSIAN_TOKEN_URL = 'https://auth.atlassian.com/oauth/token';
const ATLASSIAN_API_URL = 'https://api.atlassian.com';

export async function getJiraAccount(userId: string) {
  const accounts = await db
    .select()
    .from(account)
    .where(and(eq(account.userId, userId), eq(account.providerId, 'atlassian')))
    .limit(1);

  return accounts[0];
}

export async function refreshJiraToken(refreshToken: string) {
  const response = await fetch(ATLASSIAN_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'refresh_token',
      client_id: process.env.ATLASSIAN_CLIENT_ID,
      client_secret: process.env.ATLASSIAN_CLIENT_SECRET,
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Token refresh failed:', errorText);
    throw new Error('Failed to refresh Jira token');
  }

  return response.json();
}

export async function getValidJiraToken(userId: string) {
  const acct = await getJiraAccount(userId);
  if (!acct) throw new Error('No Jira account connected');

  // Check expiration (give 5 min buffer)
  // Note: better-auth stores accessTokenExpiresAt.
  // If it's null, we assume it's valid or we try to use it and fail.
  // But for OAuth2 it should be there.
  const expiresAt = acct.accessTokenExpiresAt;

  if (expiresAt && new Date(expiresAt).getTime() - 300000 < Date.now()) {
    console.log('Refreshing Jira token...');
    if (!acct.refreshToken) throw new Error('No refresh token available');

    try {
      const newTokens = await refreshJiraToken(acct.refreshToken);

      // Update DB
      // Note: Atlassian returns 'expires_in' (seconds).
      const newExpiresAt = new Date(Date.now() + newTokens.expires_in * 1000);

      await db
        .update(account)
        .set({
          accessToken: newTokens.access_token,
          refreshToken: newTokens.refresh_token,
          accessTokenExpiresAt: newExpiresAt,
          updatedAt: new Date(),
        })
        .where(eq(account.id, acct.id));

      return newTokens.access_token;
    } catch (e) {
      console.error('Failed to refresh token', e);
      throw e;
    }
  }

  return acct.accessToken;
}

export async function getJiraResources(accessToken: string) {
  const res = await fetch(
    `${ATLASSIAN_API_URL}/oauth/token/accessible-resources`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );
  if (!res.ok) throw new Error('Failed to fetch Jira resources');
  return res.json();
}

export async function getJiraProjects(cloudId: string, accessToken: string) {
  const res = await fetch(
    `${ATLASSIAN_API_URL}/ex/jira/${cloudId}/rest/api/3/project`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );
  if (!res.ok) throw new Error('Failed to fetch Jira projects');
  return res.json();
}

/**
 * Get Jira issues (work items) with optional JQL filtering
 * @param cloudId - The Jira cloud ID
 * @param accessToken - Valid access token
 * @param jql - Optional JQL query string (e.g., "project = PROJ AND status = 'In Progress'")
 * @param maxResults - Maximum number of results to return (default: 50)
 * @param startAt - Starting index for pagination (default: 0)
 */
export async function getJiraIssues(
  cloudId: string,
  accessToken: string,
  jql?: string,
  maxResults = 50,
  nextPageToken?: string,
) {
  // Use the new /search/jql endpoint (POST method) with nextPageToken pagination
  const requestBody: any = {
    jql: jql || 'order by created DESC',
    maxResults,
    fields: [
      'summary',
      'description',
      'status',
      'assignee',
      'priority',
      'issuetype',
      'created',
      'updated',
      'parent',
      'subtasks',
    ],
  };

  // Add nextPageToken for pagination if provided
  if (nextPageToken) {
    requestBody.nextPageToken = nextPageToken;
  }

  const res = await fetch(
    `${ATLASSIAN_API_URL}/ex/jira/${cloudId}/rest/api/3/search/jql`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    },
  );

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Get issues failed:', res.status, res.statusText, errorText);
    throw new Error(
      `Failed to fetch Jira issues: ${res.status} ${res.statusText} - ${errorText}`,
    );
  }

  return res.json();
}

/**
 * Get a single Jira issue by key or ID
 */
export async function getJiraIssue(
  cloudId: string,
  accessToken: string,
  issueIdOrKey: string,
) {
  const res = await fetch(
    `${ATLASSIAN_API_URL}/ex/jira/${cloudId}/rest/api/3/issue/${issueIdOrKey}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Get issue failed:', errorText);
    throw new Error(`Failed to fetch Jira issue: ${res.statusText}`);
  }

  return res.json();
}

/**
 * Update a Jira issue
 * @param cloudId - The Jira cloud ID
 * @param accessToken - Valid access token
 * @param issueIdOrKey - Issue key (e.g., "PROJ-123") or ID
 * @param updateData - Data to update (follows Jira API v3 format)
 */
export async function updateJiraIssue(
  cloudId: string,
  accessToken: string,
  issueIdOrKey: string,
  updateData: JiraIssueUpdateData,
) {
  const res = await fetch(
    `${ATLASSIAN_API_URL}/ex/jira/${cloudId}/rest/api/3/issue/${issueIdOrKey}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    },
  );

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Update issue failed:', errorText);
    throw new Error(`Failed to update Jira issue: ${res.statusText}`);
  }

  // PUT returns 204 No Content on success
  return res.status === 204 ? { success: true } : res.json();
}

export async function createJiraIssue(
  cloudId: string,
  accessToken: string,
  issueData: JiraIssueData,
) {
  const res = await fetch(
    `${ATLASSIAN_API_URL}/ex/jira/${cloudId}/rest/api/3/issue`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(issueData),
    },
  );

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Create issue failed:', errorText);
    throw new Error(`Failed to create Jira issue: ${res.statusText}`);
  }
  return res.json();
}

/**
 * Delete a Jira issue
 */
export async function deleteJiraIssue(
  cloudId: string,
  accessToken: string,
  issueIdOrKey: string,
) {
  const res = await fetch(
    `${ATLASSIAN_API_URL}/ex/jira/${cloudId}/rest/api/3/issue/${issueIdOrKey}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Delete issue failed:', errorText);
    throw new Error(`Failed to delete Jira issue: ${res.statusText}`);
  }

  return { success: true };
}
