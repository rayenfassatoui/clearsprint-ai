'use server';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { projects } from '@/lib/db/schema';
import { getValidJiraToken } from '@/lib/jira';
import type { JiraProjectDiscovery, JiraProject } from '@/types/jira';
import { eq, and } from 'drizzle-orm';
import { headers } from 'next/headers';
import { createProjectFromJira } from './jira.server';
import { revalidatePath } from 'next/cache';

export async function getAllAvailableJiraProjects(): Promise<{
  success: boolean;
  projects: JiraProjectDiscovery[];
  error?: string;
}> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, projects: [], error: 'Unauthorized' };
    }

    const userId = session.user.id;
    let accessToken: string;

    try {
      accessToken = await getValidJiraToken(userId);
    } catch (error) {
      console.error('Failed to get Jira token:', error);
      return { success: false, projects: [], error: 'Failed to authenticate with Jira' };
    }

    // 1. Get accessible resources (sites)
    const resourcesRes = await fetch('https://api.atlassian.com/oauth/token/accessible-resources', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    });

    if (!resourcesRes.ok) {
      return { success: false, projects: [], error: 'Failed to fetch Jira resources' };
    }

    const resources: { id: string; name: string; url: string }[] = await resourcesRes.json();

    // 2. Fetch projects from all sites
    const allProjects: JiraProjectDiscovery[] = [];

    for (const resource of resources) {
      const projectsRes = await fetch(`https://api.atlassian.com/ex/jira/${resource.id}/rest/api/3/project`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      });

      if (projectsRes.ok) {
        const jiraProjects: JiraProject[] = await projectsRes.json();
        
        // Map to discovery type
        const mappedProjects = jiraProjects.map((p) => ({
          id: p.id,
          key: p.key,
          name: p.name,
          avatarUrl: p.avatarUrls['48x48'],
          projectTypeKey: p.projectTypeKey,
          cloudId: resource.id,
          syncStatus: 'available' as const, // Default, will update below
        }));

        allProjects.push(...mappedProjects);
      }
    }

    // 3. Check sync status
    // Get all projects for this user that have a jiraProjectKey
    const userProjects = await db
      .select({
        id: projects.id,
        jiraProjectKey: projects.jiraProjectKey,
      })
      .from(projects)
      .where(eq(projects.userId, userId));

    // Create a map for faster lookup
    const syncedProjectMap = new Map<string, number>();
    userProjects.forEach((p) => {
      if (p.jiraProjectKey) {
        syncedProjectMap.set(p.jiraProjectKey, p.id);
      }
    });

    // Update status
    const finalProjects = allProjects.map((p) => {
      if (syncedProjectMap.has(p.key)) {
        return {
          ...p,
          syncStatus: 'synced' as const,
          localProjectId: syncedProjectMap.get(p.key)?.toString(),
        };
      }
      return p;
    });

    return { success: true, projects: finalProjects };
  } catch (error) {
    console.error('Error in getAllAvailableJiraProjects:', error);
    return { success: false, projects: [], error: 'Internal server error' };
  }
}

export async function checkProjectSyncStatus(jiraProjectKey: string): Promise<{
  isSynced: boolean;
  localProjectId?: string;
}> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { isSynced: false };
  }

  const project = await db.query.projects.findFirst({
    where: and(
      eq(projects.userId, session.user.id),
      eq(projects.jiraProjectKey, jiraProjectKey)
    ),
    columns: {
      id: true,
    },
  });

  if (project) {
    return { isSynced: true, localProjectId: project.id.toString() };
  }

  return { isSynced: false };
}

export async function quickSyncJiraProject(
  cloudId: string,
  jiraProjectKey: string,
  projectName: string
) {
  try {
    const result = await createProjectFromJira(cloudId, jiraProjectKey, projectName);
    
    if (result.error) {
      return { success: false, error: result.error };
    }

    revalidatePath('/dashboard/projects-list');
    return { success: true, projectId: result.projectId };
  } catch (error) {
    console.error('Error in quickSyncJiraProject:', error);
    return { success: false, error: 'Failed to sync project' };
  }
}

export async function getJiraSites() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) return [];

  try {
    const accessToken = await getValidJiraToken(session.user.id);
    const resourcesRes = await fetch('https://api.atlassian.com/oauth/token/accessible-resources', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    });

    if (!resourcesRes.ok) return [];
    return await resourcesRes.json() as { id: string; name: string; url: string }[];
  } catch {
    return [];
  }
}
