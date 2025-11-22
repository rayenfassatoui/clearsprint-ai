'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import {
  getJiraSites,
  getJiraProjectsList,
  createProjectFromJira,
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

interface ImportJiraFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ImportJiraForm({ onSuccess, onCancel }: ImportJiraFormProps) {
  const router = useRouter();
  const [sites, setSites] = useState<JiraResource[]>([]);
  const [selectedSite, setSelectedSite] = useState<string>('');
  const [projects, setProjects] = useState<JiraProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [loading, setLoading] = useState({
    sites: false,
    projects: false,
    import: false,
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
    } catch {
      toast.error('Failed to load Jira sites');
    } finally {
      setLoading((prev) => ({ ...prev, sites: false }));
    }
  }, []);

  useEffect(() => {
    loadSites();
  }, [loadSites]);

  const loadProjects = useCallback(async (cloudId: string) => {
    setLoading((prev) => ({ ...prev, projects: true }));
    try {
      const result = await getJiraProjectsList(cloudId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      if (result.projects) {
        setProjects(result.projects);
      }
    } catch {
      toast.error('Failed to load projects');
    } finally {
      setLoading((prev) => ({ ...prev, projects: false }));
    }
  }, []);

  useEffect(() => {
    if (selectedSite) {
      loadProjects(selectedSite);
    }
  }, [selectedSite, loadProjects]);

  const handleImport = async () => {
    if (!selectedSite || !selectedProject) return;

    setLoading((prev) => ({ ...prev, import: true }));
    try {
      const project = projects.find((p) => p.key === selectedProject);
      if (!project) return;

      const result = await createProjectFromJira(
        selectedSite,
        selectedProject,
        project.name,
      );

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success('Project imported successfully');
      if (onSuccess) onSuccess();

      router.refresh();
      if (result.projectId) {
        router.push(`/dashboard/projects/${result.projectId}`);
      }
    } catch {
      toast.error('Failed to import issues');
    } finally {
      setLoading((prev) => ({ ...prev, import: false }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="jira-site-import">Jira Site</Label>
          <Select
            value={selectedSite}
            onValueChange={setSelectedSite}
            disabled={loading.sites || loading.import}
          >
            <SelectTrigger id="jira-site-import">
              <SelectValue placeholder="Select a site" />
            </SelectTrigger>
            <SelectContent>
              {sites.map((site) => (
                <SelectItem key={site.id} value={site.id}>
                  {site.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedSite && (
          <div className="grid gap-2">
            <Label htmlFor="jira-project-import">Project</Label>
            <Select
              value={selectedProject}
              onValueChange={setSelectedProject}
              disabled={loading.projects || loading.import}
            >
              <SelectTrigger id="jira-project-import">
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
      </div>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={loading.import}
          >
            Cancel
          </Button>
        )}
        <Button
          onClick={handleImport}
          disabled={!selectedSite || !selectedProject || loading.import}
        >
          {loading.import && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Import Project
        </Button>
      </div>
    </div>
  );
}
