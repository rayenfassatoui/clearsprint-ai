'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Download } from 'lucide-react';
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

export function ImportJiraModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [sites, setSites] = useState<JiraResource[]>([]);
  const [selectedSite, setSelectedSite] = useState<string>('');
  const [projects, setProjects] = useState<JiraProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [loading, setLoading] = useState({
    sites: false,
    projects: false,
    import: false,
  });

  const loadSites = async () => {
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
    } finally {
      setLoading((prev) => ({ ...prev, sites: false }));
    }
  };

  const loadProjects = async (cloudId: string) => {
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
  };

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
      setOpen(false);
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Import from Jira
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import from Jira</DialogTitle>
          <DialogDescription>
            Select a Jira project to import as a new workspace.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="jira-site-import" className="text-right">
              Jira Site
            </Label>
            <Select
              value={selectedSite}
              onValueChange={setSelectedSite}
              disabled={loading.sites || loading.import}
            >
              <SelectTrigger id="jira-site-import" className="col-span-3">
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="jira-project-import" className="text-right">
                Project
              </Label>
              <Select
                value={selectedProject}
                onValueChange={setSelectedProject}
                disabled={loading.projects || loading.import}
              >
                <SelectTrigger id="jira-project-import" className="col-span-3">
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

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading.import}
          >
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={!selectedSite || !selectedProject || loading.import}
          >
            {loading.import && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Import Project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
