'use client';

import { Loader2, RefreshCw, Download, UploadCloud } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  getJiraProjectsList,
  getJiraSites,
  importFromJira,
  syncToJira,
} from '@/actions/jira.server';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function SyncWithJiraModal({
  projectId,
  projectTitle,
  trigger,
}: {
  projectId: number;
  projectTitle: string;
  trigger?: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [sites, setSites] = useState<any[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<string>('');
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectKey, setSelectedProjectKey] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadSites();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedSiteId) {
      loadProjects(selectedSiteId);
    }
  }, [selectedSiteId]);

  async function loadSites() {
    setLoading(true);
    const res = await getJiraSites();
    if (res.success) {
      setSites(res.resources);
      if (res.resources && res.resources.length === 1) {
        setSelectedSiteId(res.resources[0].id);
      }
    } else {
      toast.error(res.error);
    }
    setLoading(false);
  }

  async function loadProjects(cloudId: string) {
    setLoading(true);
    const res = await getJiraProjectsList(cloudId);
    if (res.success) {
      setProjects(res.projects);
    } else {
      toast.error(res.error);
    }
    setLoading(false);
  }

  async function handleSync() {
    if (!selectedSiteId || !selectedProjectKey) return;
    setProcessing(true);
    const res = await syncToJira(projectId, selectedSiteId, selectedProjectKey);
    if (res.success) {
      toast.success(`Successfully synced ${res.syncedCount} tickets to Jira!`);
      setIsOpen(false);
    } else {
      toast.error(res.error);
    }
    setProcessing(false);
  }

  async function handleImport() {
    if (!selectedSiteId || !selectedProjectKey) return;
    setProcessing(true);
    const res = await importFromJira(projectId, selectedSiteId, selectedProjectKey);
    if (res.success) {
      toast.success(`Successfully imported ${res.importedCount} tickets from Jira!`);
      setIsOpen(false);
      // Optional: Refresh page or data
      window.location.reload();
    } else {
      toast.error(res.error);
    }
    setProcessing(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Sync with Jira
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Sync &quot;{projectTitle}&quot; with Jira</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Jira Site</label>
            <Select
              value={selectedSiteId}
              onValueChange={setSelectedSiteId}
              disabled={loading || sites.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a site" />
              </SelectTrigger>
              <SelectContent>
                {sites.map((site) => (
                  <SelectItem key={site.id} value={site.id}>
                    {site.name} ({site.url})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedSiteId && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Jira Project</label>
              <Select
                value={selectedProjectKey}
                onValueChange={setSelectedProjectKey}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((proj) => (
                    <SelectItem key={proj.key} value={proj.key}>
                      {proj.name} ({proj.key})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Tabs defaultValue="import" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="import">Import from Jira</TabsTrigger>
              <TabsTrigger value="sync">Sync to Jira</TabsTrigger>
            </TabsList>
            <TabsContent value="import" className="space-y-4 pt-4">
              <div className="text-sm text-muted-foreground">
                Import tickets from the selected Jira project into ClearSprint AI.
                Existing tickets will be updated.
              </div>
              <Button
                className="w-full"
                onClick={handleImport}
                disabled={processing || !selectedProjectKey}
              >
                {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                {processing ? 'Importing...' : 'Import from Jira'}
              </Button>
            </TabsContent>
            <TabsContent value="sync" className="space-y-4 pt-4">
              <div className="text-sm text-muted-foreground">
                Sync local tickets to the selected Jira project.
                New tickets will be created in Jira, and existing ones updated.
              </div>
              <Button
                className="w-full"
                onClick={handleSync}
                disabled={processing || !selectedProjectKey}
              >
                {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                {processing ? 'Syncing...' : 'Sync to Jira'}
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
