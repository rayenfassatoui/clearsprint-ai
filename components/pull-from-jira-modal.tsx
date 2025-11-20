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
import { Loader2, Download } from 'lucide-react';
import { importFromJira } from '@/actions/jira.server';

interface PullFromJiraModalProps {
  projectId: number;
  cloudId: string;
  jiraProjectKey: string;
}

export function PullFromJiraModal({
  projectId,
  cloudId,
  jiraProjectKey,
}: PullFromJiraModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePull = async () => {
    setLoading(true);
    try {
      const result = await importFromJira(projectId, cloudId, jiraProjectKey);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(`Pulled ${result.importedCount || 0} tickets from Jira`);
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast.error('Failed to pull from Jira');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Pull from Jira
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pull from Jira</DialogTitle>
          <DialogDescription>
            Import the latest changes from Jira project "{jiraProjectKey}". This
            will update existing tickets and add new ones.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={handlePull} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Pull Updates
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
