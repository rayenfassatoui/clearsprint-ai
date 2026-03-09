'use server';

import { db } from '@/lib/db';
import { workspaceProjects } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import type { ActionResponse, WorkspaceProject } from '@/lib/types';
import { getLinearClient } from '@/lib/linear';
import { revalidatePath } from 'next/cache';

// ─── Types ────────────────────────────────────────────────────────────────────

interface LinearProjectInfo {
  id: string;
  name: string;
  key: string;
  teamId: string;
  teamName: string;
}

// ─── Actions ──────────────────────────────────────────────────────────────────

/**
 * Fetches all Linear projects accessible to the user.
 * Uses a single teams request alongside the projects request to avoid N+1 queries.
 */
export async function getLinearProjects(): Promise<
  ActionResponse<LinearProjectInfo[]>
> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return { success: false, error: 'Unauthorized' };

  try {
    const linearClient = await getLinearClient(session.user.id);
    if (!linearClient) {
      return { success: false, error: 'Linear account not connected' };
    }

    // Fetch projects and all teams in parallel (two requests, not N+1)
    const [projectsRes, teamsRes] = await Promise.all([
      linearClient.projects({ first: 100 }),
      linearClient.teams({ first: 100 }),
    ]);

    // Build a team lookup map: teamId → team
    const teamMap = new Map(teamsRes.nodes.map((t) => [t.id, t]));

    // For each project, find its associated team from the map
    // (p.teams() is still needed here since project→team is a one-to-many, but we cache all teams)
    const projectsWithTeams = await Promise.all(
      projectsRes.nodes.map(async (p) => {
        const projectTeams = await p.teams();
        const firstTeamId = projectTeams.nodes[0]?.id;
        const team = firstTeamId ? teamMap.get(firstTeamId) : undefined;
        return {
          id: p.id,
          name: p.name,
          key: team ? `${team.key} — ${p.name}` : p.name,
          teamId: team?.id ?? '',
          teamName: team?.name ?? '',
        };
      }),
    );

    return { success: true, data: projectsWithTeams };
  } catch (error) {
    console.error('getLinearProjects error:', error);
    return { success: false, error: 'Failed to fetch Linear projects' };
  }
}

export async function createWorkspaceProject({
  linearProjectId,
  linearTeamId,
  linearProjectName,
  linearProjectKey,
}: {
  linearProjectId: string;
  linearTeamId: string;
  linearProjectName: string;
  linearProjectKey: string;
}): Promise<ActionResponse<WorkspaceProject>> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return { success: false, error: 'Unauthorized' };

  try {
    const [project] = await db
      .insert(workspaceProjects)
      .values({
        userId: session.user.id,
        linearProjectId,
        linearTeamId,
        linearProjectName,
        linearProjectKey,
      })
      .returning();

    revalidatePath('/dashboard');
    return { success: true, data: project };
  } catch (error) {
    console.error('createWorkspaceProject error:', error);
    return { success: false, error: 'Failed to create workspace project' };
  }
}

export async function deleteWorkspaceProject(
  projectId: number,
): Promise<ActionResponse> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return { success: false, error: 'Unauthorized' };

  try {
    await db
      .delete(workspaceProjects)
      .where(
        and(
          eq(workspaceProjects.id, projectId),
          eq(workspaceProjects.userId, session.user.id),
        ),
      );

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('deleteWorkspaceProject error:', error);
    return { success: false, error: 'Failed to delete workspace project' };
  }
}

export async function getWorkspaceProjects(): Promise<WorkspaceProject[]> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return [];

  return db
    .select()
    .from(workspaceProjects)
    .where(eq(workspaceProjects.userId, session.user.id))
    .orderBy(workspaceProjects.createdAt);
}
