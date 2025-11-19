import { Suspense } from 'react';
import { NewProjectModal } from '@/components/new-project-modal';
import { ProjectList } from '@/components/project-list';
import { ProjectCardSkeleton } from '@/components/skeletons';

export default function ProjectsPage() {
  return (
    <div className='space-y-8'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Projects</h1>
          <p className='text-muted-foreground mt-1'>
            Manage and organize your sprint projects
          </p>
        </div>
        <NewProjectModal />
      </div>

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
  );
}
