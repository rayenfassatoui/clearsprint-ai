'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, CloudUpload, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { pullFromLinear } from '../actions/pull-sync.server';
import type { WorkspaceProject } from '@/lib/types';

interface WorkspaceHeaderProps {
  project: WorkspaceProject;
  pendingChangesCount: number;
  isPushing?: boolean;
  onPullSuccess?: () => void;
  onPushClick?: () => void;
}

export function WorkspaceHeader({
  project,
  pendingChangesCount,
  isPushing = false,
  onPullSuccess,
  onPushClick,
}: WorkspaceHeaderProps) {
  const [pulling, setPulling] = useState(false);

  const handlePull = async () => {
    setPulling(true);
    try {
      const res = await pullFromLinear(project.userId, project.id);
      if (res.success && res.data) {
        toast.success(
          `Pulled ${res.data.added} new, updated ${res.data.updated}, deleted ${res.data.deleted}`,
        );
        onPullSuccess?.();
      } else {
        toast.error(res.error || 'Failed to pull from Linear');
      }
    } catch (err) {
      console.error(err);
      toast.error('An unexpected error occurred during pull');
    } finally {
      setPulling(false);
    }
  };

  return (
    <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 py-6 border-b border-border/40'>
      <div>
        <div className='flex items-center gap-3'>
          <h1 className='text-2xl font-bold tracking-tight text-foreground'>
            {project.linearProjectName}
          </h1>
          <a
            href={`https://linear.app/${project.linearTeamId}/project/${project.linearProjectId}`}
            target='_blank'
            rel='noopener noreferrer'
            className='text-muted-foreground hover:text-[#5E6AD2] transition-colors'
            title='Open in Linear'
          >
            <ExternalLink className='w-5 h-5' />
          </a>
        </div>
        <p className='text-sm text-muted-foreground mt-1'>
          {project.linearProjectKey} • Last synced:{' '}
          {project.lastSyncedAt
            ? new Date(project.lastSyncedAt).toLocaleString()
            : 'Never'}
        </p>
      </div>

      <div className='flex items-center gap-3'>
        <Button
          variant='outline'
          onClick={handlePull}
          disabled={pulling || isPushing}
          title={isPushing ? 'Cannot pull while pushing' : undefined}
          className='bg-card shadow-sm border-muted/50'
        >
          <RefreshCw
            className={`w-4 h-4 mr-2 text-muted-foreground ${
              pulling ? 'animate-spin' : ''
            }`}
          />
          Pull from Linear
        </Button>
        <Button
          onClick={onPushClick}
          disabled={pendingChangesCount === 0}
          className='bg-[#5E6AD2] hover:bg-[#4E5BCE] text-white shadow-md shadow-[#5E6AD2]/20'
        >
          <CloudUpload className='w-4 h-4 mr-2' />
          Review & Push ({pendingChangesCount})
        </Button>
      </div>
    </div>
  );
}
