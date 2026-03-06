'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { quickSyncJiraProject } from '@/features/jira/actions/jira-discovery.server';
import { Loader2, Check, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface QuickSyncButtonProps {
  cloudId: string;
  jiraProjectKey: string;
  projectName: string;
}

export function QuickSyncButton({ cloudId, jiraProjectKey, projectName }: QuickSyncButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const handleSync = async () => {
    setIsLoading(true);
    try {
      const result = await quickSyncJiraProject(cloudId, jiraProjectKey, projectName);
      
      if (result.success) {
        setIsSuccess(true);
        toast.success(`Project "${projectName}" synced successfully!`);
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to sync project');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <Button size="sm" variant="outline" className="gap-2 text-green-600 border-green-200 bg-green-50" disabled>
        <Check className="h-4 w-4" />
        Synced
      </Button>
    );
  }

  return (
    <Button 
      size="sm" 
      variant="outline" 
      className="gap-2" 
      onClick={handleSync}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Syncing...
        </>
      ) : (
        <>
          <RefreshCw className="h-4 w-4" />
          Sync Project
        </>
      )}
    </Button>
  );
}
