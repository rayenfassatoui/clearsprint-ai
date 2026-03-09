import { Suspense } from 'react';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { NewProjectModal } from '@/features/projects/components/new-project-modal';
import { ProjectList } from '@/features/projects/components/project-list';
import { ProjectCardSkeleton } from '@/components/skeletons';
import { checkLinearConnectionStatus } from '@/features/auth/actions/user.server';
import { LinearProjectPicker } from '@/features/linear-sync/components/linear-project-picker';

export default async function ProjectsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  const linearStatus = await checkLinearConnectionStatus();

  return (
    <div className='space-y-8'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Projects</h1>
          <p className='text-muted-foreground mt-1'>
            Manage and organize your sprint projects
          </p>
        </div>
        <div className='flex gap-2'>
          {linearStatus.connected && <LinearProjectPicker />}
          <NewProjectModal />
        </div>
      </div>

      <div className='space-y-4'>
        <h2 className='text-xl font-semibold tracking-tight'>Your Projects</h2>
        <Suspense
          fallback={
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              <ProjectCardSkeleton />
              <ProjectCardSkeleton />
              <ProjectCardSkeleton />
            </div>
          }
        >
          <ProjectList />
        </Suspense>
      </div>
    </div>
  );
}
