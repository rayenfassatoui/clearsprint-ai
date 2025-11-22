'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  getJiraSites,
  getJiraProjectsList,
  getJiraIssuesList,
} from '@/features/jira/actions/jira.server';

interface JiraResource {
  id: string;
  name: string;
  url: string;
}

interface JiraProject {
  id: string;
  key: string;
  name: string;
}

interface JiraIssue {
  id: string;
  key: string;
  fields: {
    summary: string;
    status: {
      name: string;
    };
    issuetype: {
      name: string;
    };
  };
}

export function JiraIntegrationDashboard() {
  const [sites, setSites] = useState<JiraResource[]>([]);
  const [selectedSite, setSelectedSite] = useState<string>('');
  const [projects, setProjects] = useState<JiraProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [issues, setIssues] = useState<JiraIssue[]>([]);
  const [loading, setLoading] = useState({
    sites: true,
    projects: false,
    issues: false,
  });

  const loadSites = useCallback(async () => {
    setLoading((prev) => ({ ...prev, sites: true }));
    try {
      const result = await getJiraSites();
      if (result.error) {
        toast.error(result.error);
        return;
      }
      if (result.resources) {
        setSites(result.resources);
        if (result.resources.length > 0) {
          setSelectedSite(result.resources[0].id);
        }
      }
    } catch (error) {
      toast.error('Failed to load Jira sites');
      console.error(error);
    } finally {
      setLoading((prev) => ({ ...prev, sites: false }));
    }
  }, []);

  const loadProjects = useCallback(async (cloudId: string) => {
    setLoading((prev) => ({ ...prev, projects: true }));
    setProjects([]);
    setSelectedProject('');
    try {
      const result = await getJiraProjectsList(cloudId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      if (result.projects) {
        setProjects(result.projects);
      }
    } catch (error) {
      toast.error('Failed to load projects');
      console.error(error);
    } finally {
      setLoading((prev) => ({ ...prev, projects: false }));
    }
  }, []);

  const loadIssues = useCallback(
    async (cloudId: string, projectKey: string) => {
      setLoading((prev) => ({ ...prev, issues: true }));
      setIssues([]);
      try {
        const result = await getJiraIssuesList(
          cloudId,
          `project = ${projectKey}`,
          50,
        );
        if (result.error) {
          toast.error(result.error);
          return;
        }
        if (result.issues) {
          setIssues(result.issues);
        }
      } catch (error) {
        toast.error('Failed to load issues');
        console.error(error);
      } finally {
        setLoading((prev) => ({ ...prev, issues: false }));
      }
    },
    [],
  );

  // Load Jira sites on mount
  useEffect(() => {
    loadSites();
  }, [loadSites]);

  // Load projects when site changes
  useEffect(() => {
    if (selectedSite) {
      loadProjects(selectedSite);
    }
  }, [selectedSite, loadProjects]);

  // Load issues when project changes
  useEffect(() => {
    if (selectedSite && selectedProject) {
      loadIssues(selectedSite, selectedProject);
    }
  }, [selectedSite, selectedProject, loadIssues]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Jira Integration</CardTitle>
          <CardDescription>
            View and manage your Jira projects and issues
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Site Selector */}
          <div className="space-y-2">
            <label htmlFor="jira-site-select" className="text-sm font-medium">
              Jira Site
            </label>
            {loading.sites ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select value={selectedSite} onValueChange={setSelectedSite}>
                <SelectTrigger id="jira-site-select">
                  <SelectValue placeholder="Select a Jira site" />
                </SelectTrigger>
                <SelectContent>
                  {sites.map((site) => (
                    <SelectItem key={site.id} value={site.id}>
                      {site.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Project Selector */}
          <div className="space-y-2">
            <label
              htmlFor="jira-project-select"
              className="text-sm font-medium"
            >
              Project
            </label>
            {loading.projects ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select
                value={selectedProject}
                onValueChange={setSelectedProject}
                disabled={!selectedSite || projects.length === 0}
              >
                <SelectTrigger id="jira-project-select">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.key}>
                      {project.name} ({project.key})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Issues List */}
      {selectedProject && (
        <Card>
          <CardHeader>
            <CardTitle>Issues</CardTitle>
            <CardDescription>
              {issues.length} issues found in {selectedProject}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading.issues ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: Skeletons are static
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : issues.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No issues found in this project
              </p>
            ) : (
              <div className="space-y-3">
                {issues.map((issue) => (
                  <div
                    key={issue.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono text-muted-foreground">
                          {issue.key}
                        </span>
                        <span className="text-sm font-medium">
                          {issue.fields.summary}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{issue.fields.issuetype.name}</span>
                        <span>•</span>
                        <span>{issue.fields.status.name}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
