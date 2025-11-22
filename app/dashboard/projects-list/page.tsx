import { Suspense } from 'react';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { getJiraAccount } from '@/lib/jira';
import { NewProjectModal } from '@/features/projects/components/new-project-modal';
import { ProjectList } from '@/features/projects/components/project-list';
import { ProjectCardSkeleton } from '@/components/skeletons';

export default async function ProjectsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  let jiraConnected = false;
  if (session) {
    try {
      const jiraAccount = await getJiraAccount(session.user.id);
      jiraConnected = !!jiraAccount;
    } catch {
      // Ignore error
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground mt-1">
            Manage and organize your sprint projects
          </p>
        </div>
        <NewProjectModal jiraConnected={jiraConnected} />
      </div>

      <Suspense
        fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
