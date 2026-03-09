import { eq } from 'drizzle-orm';
import { ChevronLeft } from 'lucide-react';
import { headers } from 'next/headers';
import Link from 'next/link';
import { KanbanBoard } from '@/features/tickets/components/kanban-board';
import { GeneralAiEditDialog } from '@/features/tickets/components/refine-all-dialog';
import { EmptyProjectState } from '@/features/projects/components/empty-project-state';

import { Button } from '@/components/ui/button';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { projects } from '@/lib/db/schema';
import { getProjectTickets } from '@/features/tickets/actions/tickets.server';

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const projectId = parseInt(id);

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return <div>Unauthorized</div>;
  }

  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId));

  if (!project) {
    return <div>Project not found</div>;
  }

  const ticketsResult = await getProjectTickets(projectId);
  const tickets = ticketsResult.success ? ticketsResult.tickets : [];

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-4'>
          <Link href='/dashboard'>
            <Button variant='ghost' size='icon'>
              <ChevronLeft className='h-4 w-4' />
            </Button>
          </Link>
          <div>
            <h1 className='text-2xl font-bold'>{project.name}</h1>
            <p className='text-muted-foreground'>Manage your backlog</p>
          </div>
        </div>
        <div className='flex items-center space-x-2'>
          {tickets && tickets.length > 0 && (
            <>
              {/* GenerateButton removed from here as it should only be visible when no tickets exist */}
              <GeneralAiEditDialog projectId={projectId} />
            </>
          )}
        </div>
      </div>

      <div className='bg-muted/30 p-6 rounded-xl border min-h-[calc(100vh-200px)]'>
        {!tickets || tickets.length === 0 ? (
          <EmptyProjectState
            projectId={projectId}
            docUrl={project.docUrl}
            docName={project.name}
          />
        ) : (
          <KanbanBoard projectId={projectId} initialTickets={tickets} />
        )}
      </div>
    </div>
  );
}
