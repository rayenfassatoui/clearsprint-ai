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
    <div className="space-y-8 mt-4">
      <div className="space-y-6">
        <div className="space-y-3">
          <Label
            htmlFor="jira-site-import"
            className="text-base font-medium flex items-center gap-2"
          >
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
              1
            </span>
            Select Jira Site
          </Label>
          <Select
            value={selectedSite}
            onValueChange={setSelectedSite}
            disabled={loading.sites || loading.import}
          >
            <SelectTrigger
              id="jira-site-import"
              className="h-12 text-base bg-background border-input/60 hover:border-primary/50 transition-colors shadow-sm"
            >
              <SelectValue placeholder="Choose your Jira workspace..." />
            </SelectTrigger>
            <SelectContent>
              {sites.map((site) => (
                <SelectItem
                  key={site.id}
                  value={site.id}
                  className="py-3 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded bg-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-600">
                      {site.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium">{site.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {site.url}
                      </span>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div
          className={`space-y-3 transition-all duration-500 ${selectedSite ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-2 grayscale'}`}
        >
          <Label
            htmlFor="jira-project-import"
            className="text-base font-medium flex items-center gap-2"
          >
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
              2
            </span>
            Select Project
          </Label>
          <Select
            value={selectedProject}
            onValueChange={setSelectedProject}
            disabled={!selectedSite || loading.projects || loading.import}
          >
            <SelectTrigger
              id="jira-project-import"
              className="h-12 text-base bg-background border-input/60 hover:border-primary/50 transition-colors shadow-sm"
            >
              <SelectValue
                placeholder={
                  selectedSite
                    ? 'Choose a project to import...'
                    : 'Select a site first'
                }
              />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem
                  key={project.id}
                  value={project.key}
                  className="py-3 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded bg-orange-500/20 flex items-center justify-center text-xs font-bold text-orange-600">
                      {project.key.substring(0, 2)}
                    </div>
                    <span>{project.name}</span>
                    <span className="text-muted-foreground text-xs ml-auto border px-1.5 rounded bg-muted/50">
                      {project.key}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        {onCancel && (
          <Button
            variant="ghost"
            onClick={onCancel}
            disabled={loading.import}
            className="h-11 px-6"
          >
            Cancel
          </Button>
        )}
        <Button
          onClick={handleImport}
          disabled={!selectedSite || !selectedProject || loading.import}
          className="h-11 px-8 bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 transition-all shadow-md hover:shadow-lg"
        >
          {loading.import ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Importing...
            </>
          ) : (
            <>Import Project</>
          )}
        </Button>
      </div>
    </div>
  );
}
