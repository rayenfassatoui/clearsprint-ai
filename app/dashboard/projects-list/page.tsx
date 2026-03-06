import { Suspense } from 'react';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { getJiraAccount } from '@/lib/jira';
import { NewProjectModal } from '@/features/projects/components/new-project-modal';
import { ProjectList } from '@/features/projects/components/project-list';
import { ProjectCardSkeleton } from '@/components/skeletons';
import { JiraProjectsDiscovery } from '@/features/jira/components/jira-projects-discovery';
import { JiraDiscoverySkeleton } from '@/features/jira/components/jira-discovery-skeleton';
import { Separator } from '@/components/ui/separator';
import { CreateJiraProjectDialog } from '@/features/jira/components/create-jira-project-dialog';
import { getJiraSites } from '@/features/jira/actions/jira-discovery.server';

export default async function ProjectsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  let jiraConnected = false;
  let jiraSites: { id: string; name: string; url: string }[] = [];
  
  if (session) {
    try {
      const jiraAccount = await getJiraAccount(session.user.id);
      jiraConnected = !!jiraAccount;
      if (jiraConnected) {
        jiraSites = await getJiraSites();
      }
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
        <div className="flex gap-2">
          {jiraConnected && <CreateJiraProjectDialog sites={jiraSites} />}
          <NewProjectModal jiraConnected={jiraConnected} />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Your Projects</h2>
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

      {jiraConnected && (
        <>
          <Separator />
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold tracking-tight">Discover Jira Projects</h2>
                <p className="text-sm text-muted-foreground">
                  Sync projects from your connected Jira account
                </p>
              </div>
            </div>
            <Suspense fallback={<JiraDiscoverySkeleton />}>
              <JiraProjectsDiscovery />
            </Suspense>
          </div>
        </>
      )}
    </div>
  );
}
