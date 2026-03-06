'use client';

import { Button } from '@/components/ui/button';
import { ArrowUpCircle, ArrowDownCircle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { UnifiedSyncModal } from '@/features/jira/components/unified-sync-modal';

interface ProjectHeaderSyncBadgeProps {
  projectId: number;
  jiraProjectKey: string;
  lastSync?: Date;
}

export function ProjectHeaderSyncBadge({ projectId, jiraProjectKey }: ProjectHeaderSyncBadgeProps) {
  const [open, setOpen] = useState(false);
  // In a real app, we'd fetch this status
  const status = 'ahead' as 'synced' | 'ahead' | 'behind' | 'conflict'; 
  const changesToPush = 2;
  const changesToPull = 1;

  return (
    <>
      <Button variant="outline" size="sm" className="gap-2" onClick={() => setOpen(true)}>
        {status === 'synced' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
        {status === 'ahead' && <ArrowUpCircle className="w-4 h-4 text-blue-500" />}
        {status === 'behind' && <ArrowDownCircle className="w-4 h-4 text-orange-500" />}
        {status === 'conflict' && <AlertCircle className="w-4 h-4 text-red-500" />}
        
        <span className="hidden sm:inline">
            {status === 'synced' && 'Synced'}
            {status === 'ahead' && `${changesToPush} to Push`}
            {status === 'behind' && `${changesToPull} to Pull`}
            {status === 'conflict' && 'Sync Conflict'}
        </span>
      </Button>
      
      <UnifiedSyncModal 
        open={open} 
        onOpenChange={setOpen} 
        projectId={projectId}
        jiraProjectKey={jiraProjectKey}
      />
    </>
  );
}
