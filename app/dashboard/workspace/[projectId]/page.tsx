import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { workspaceProjects, workspaceTickets } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { WorkspaceClient } from '@/features/linear-sync/components/workspace-client';
import { WorkspaceSkeleton } from '@/features/linear-sync/components/workspace-skeleton';
import { checkLinearConnectionStatus } from '@/features/auth/actions/user.server';
import { Suspense } from 'react';

interface WorkspaceProjectPageProps {
  params: Promise<{
    projectId: string;
  }>;
}

async function WorkspaceData({
  projectId,
  userId,
}: {
  projectId: number;
  userId: string;
}) {
  // Fetch the project and verify ownership
  const [project] = await db
    .select()
    .from(workspaceProjects)
    .where(
      and(
        eq(workspaceProjects.id, projectId),
        eq(workspaceProjects.userId, userId),
      ),
    );

  if (!project) {
    notFound();
  }

  // Check linear connection
  const linearStatus = await checkLinearConnectionStatus();

  // Fetch tickets for this workspace project
  const tickets = await db
    .select()
    .from(workspaceTickets)
    .where(eq(workspaceTickets.workspaceProjectId, project.id))
    .orderBy(workspaceTickets.createdAt);

  return (
    <WorkspaceClient
      project={project}
      initialTickets={tickets}
      linearConnected={linearStatus.connected}
    />
  );
}

export default async function WorkspaceProjectPage({
  params,
}: WorkspaceProjectPageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect('/auth/signin');
  }

  const { projectId } = await params;
  const parsedId = parseInt(projectId, 10);

  if (Number.isNaN(parsedId)) {
    notFound();
  }

  return (
    <Suspense fallback={<WorkspaceSkeleton />}>
      <WorkspaceData projectId={parsedId} userId={session.user.id} />
    </Suspense>
  );
}
