'use client';

import { Loader2, UploadCloud } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  getSyncPreview,
  executeSync,
} from '@/features/jira/actions/jira.server';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { SyncPreviewModal } from './sync-preview-modal';
import type { SyncChange } from '../types';

export function SyncWithJiraModal({
  projectId,
  cloudId,
  jiraProjectKey,
  trigger,
  tooltip,
}: {
  projectId: number;
  cloudId: string;
  jiraProjectKey: string;
  trigger?: React.ReactNode;
  tooltip?: string;
}) {
  const [processing, setProcessing] = useState(false);

  // Preview State
  const [showPreview, setShowPreview] = useState(false);
  const [previewChanges, setPreviewChanges] = useState<SyncChange[]>([]);

  async function handleSyncPreview() {
    setProcessing(true);

    const res = await getSyncPreview(projectId, cloudId, jiraProjectKey);

    if (res.success && res.preview) {
      setPreviewChanges(res.preview.changes);
      setShowPreview(true);
    } else {
      toast.error(res.error || 'Failed to get sync preview');
    }
    setProcessing(false);
  }

  async function handleConfirmSync() {
    setProcessing(true);
    const res = await executeSync(
      projectId,
      cloudId,
      jiraProjectKey,
      previewChanges,
    );

    if (res.success) {
      toast.success(`Successfully synced ${res.syncedCount} tickets to Jira!`);
      setShowPreview(false);
      window.location.reload(); // Refresh to show updated statuses/IDs if any
    } else {
      toast.error(res.error);
    }
    setProcessing(false);
  }

  const triggerButton = trigger ? (
    <Button
      variant="outline"
      className="gap-2 p-0 h-auto border-none bg-transparent hover:bg-transparent"
      disabled={processing}
      onClick={handleSyncPreview}
      asChild
    >
      {trigger}
    </Button>
  ) : (
    <Button
      variant="outline"
      className="gap-2"
      disabled={processing}
      onClick={handleSyncPreview}
    >
      {processing ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <UploadCloud className="h-4 w-4" />
      )}
      Push to Jira
    </Button>
  );

  return (
    <>
      {tooltip ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>{triggerButton}</TooltipTrigger>
            <TooltipContent>
              <p>{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        triggerButton
      )}

      <SyncPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        onConfirm={handleConfirmSync}
        changes={previewChanges}
        isSyncing={processing}
      />
    </>
  );
}
