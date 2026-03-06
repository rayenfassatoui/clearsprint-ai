import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProjectSyncStatusBadge } from '@/features/projects/components/project-sync-status-badge';
import type { JiraProjectDiscovery } from '@/types/jira';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { QuickSyncButton } from './quick-sync-button';

interface JiraProjectCardProps {
  project: JiraProjectDiscovery;
}

export function JiraProjectCard({ project }: JiraProjectCardProps) {
  return (
    <Card className="group overflow-hidden transition-all hover:shadow-md border-muted/60">
      <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 rounded-lg border">
            <AvatarImage src={project.avatarUrl} alt={project.name} />
            <AvatarFallback className="rounded-lg">{project.key.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold leading-none tracking-tight">{project.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">{project.key}</p>
          </div>
        </div>
        <ProjectSyncStatusBadge status={project.syncStatus} />
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="text-xs text-muted-foreground">
          Type: <span className="font-medium text-foreground">{project.projectTypeKey}</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-end">
        {project.syncStatus === 'synced' && project.localProjectId ? (
          <Button variant="ghost" size="sm" className="gap-2" asChild>
            <Link href={`/dashboard/projects/${project.localProjectId}`}>
              View Project <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        ) : (
          <QuickSyncButton 
            cloudId={project.cloudId} 
            jiraProjectKey={project.key} 
            projectName={project.name} 
          />
        )}
      </CardFooter>
    </Card>
  );
}
