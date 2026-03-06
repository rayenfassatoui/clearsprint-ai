import { getAllAvailableJiraProjects } from '@/features/jira/actions/jira-discovery.server';
import { JiraProjectsList } from './jira-projects-list';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export async function JiraProjectsDiscovery() {
  const { success, projects, error } = await getAllAvailableJiraProjects();

  if (!success) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error || 'Failed to load Jira projects. Please try again.'}
        </AlertDescription>
      </Alert>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center p-8 border border-dashed rounded-lg">
        <p className="text-muted-foreground">No Jira projects found.</p>
      </div>
    );
  }

  return <JiraProjectsList projects={projects} />;
}
