'use client';

import { useState } from 'react';
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
import {
  getJiraSites,
  getJiraProjectsList,
  getJiraIssuesList,
} from '@/features/jira/actions/jira.server';
import { RefreshCw } from 'lucide-react';

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
    status: { name: string };
    issuetype: { name: string };
  };
}

export default function TestPage() {
  const [loading, setLoading] = useState(false);
  const [sites, setSites] = useState<JiraResource[]>([]);
  const [selectedSite, setSelectedSite] = useState<string>('');
  const [projects, setProjects] = useState<JiraProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [issues, setIssues] = useState<JiraIssue[]>([]);

  const fetchSites = async () => {
    setLoading(true);
    try {
      const result = await getJiraSites();
      if (result.error) {
        toast.error(result.error);
        return;
      }
      if (result.resources) {
        setSites(result.resources);
        toast.success(`Found ${result.resources.length} Jira site(s)`);
      }
    } catch (error) {
      toast.error('Failed to fetch Jira sites');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    if (!selectedSite) {
      toast.error('Please select a site first');
      return;
    }
    setLoading(true);
    try {
      const result = await getJiraProjectsList(selectedSite);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      if (result.projects) {
        setProjects(result.projects);
        toast.success(`Found ${result.projects.length} project(s)`);
      }
    } catch (error) {
      toast.error('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchIssues = async () => {
    if (!selectedSite || !selectedProject) {
      toast.error('Please select site and project first');
      return;
    }
    setLoading(true);
    try {
      const result = await getJiraIssuesList(
        selectedSite,
        `project = "${selectedProject}"`,
        50,
      );
      if (result.error) {
        toast.error(result.error);
        return;
      }
      if (result.issues) {
        setIssues(result.issues);
        toast.success(`Found ${result.issues.length} issue(s)`);
      }
    } catch (error) {
      toast.error('Failed to fetch issues');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Jira API Test</h1>
        <p className="text-muted-foreground mt-1">
          Test your Jira integration and fetch data
        </p>
      </div>

      {/* Sites */}
      <Card>
        <CardHeader>
          <CardTitle>1. Jira Sites</CardTitle>
          <CardDescription>Fetch accessible Jira sites</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={fetchSites} disabled={loading}>
            <RefreshCw
              className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`}
            />
            Fetch Sites
          </Button>
          {sites.length > 0 && (
            <div className="space-y-2">
              <Select value={selectedSite} onValueChange={setSelectedSite}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a site" />
                </SelectTrigger>
                <SelectContent>
                  {sites.map((site) => (
                    <SelectItem key={site.id} value={site.id}>
                      {site.name} - {site.url}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Projects */}
      <Card>
        <CardHeader>
          <CardTitle>2. Jira Projects</CardTitle>
          <CardDescription>Fetch projects from selected site</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={fetchProjects} disabled={loading || !selectedSite}>
            <RefreshCw
              className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`}
            />
            Fetch Projects
          </Button>
          {projects.length > 0 && (
            <div className="space-y-2">
              <Select
                value={selectedProject}
                onValueChange={setSelectedProject}
              >
                <SelectTrigger>
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
            </div>
          )}
        </CardContent>
      </Card>

      {/* Issues */}
      <Card>
        <CardHeader>
          <CardTitle>3. Jira Issues</CardTitle>
          <CardDescription>Fetch issues from selected project</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={fetchIssues}
            disabled={loading || !selectedSite || !selectedProject}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`}
            />
            Fetch Issues
          </Button>
          {issues.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">
                Found {issues.length} issues:
              </p>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {issues.map((issue) => (
                  <div
                    key={issue.id}
                    className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono text-muted-foreground">
                            {issue.key}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                            {issue.fields.issuetype.name}
                          </span>
                        </div>
                        <p className="text-sm font-medium truncate">
                          {issue.fields.summary}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {issue.fields.status.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
