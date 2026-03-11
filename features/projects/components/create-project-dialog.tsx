'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, AlertCircle, LinkIcon } from 'lucide-react';
import { ConnectLinearButton } from '@/features/linear-sync/components/connect-linear-button';
import { checkLinearConnectionStatus } from '@/features/auth/actions/user.server';
import { LinearProjectPicker } from '@/features/linear-sync/components/linear-project-picker';

interface CreateProjectDialogProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CreateProjectDialog({
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: CreateProjectDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [linearConnected, setLinearConnected] = useState(false);
  const [checking, setChecking] = useState(true);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? controlledOnOpenChange : setInternalOpen;

  const handleOpenChange = (newOpen: boolean) => {
    setOpen?.(newOpen);
  };

  const checkStatus = useCallback(async () => {
    setChecking(true);
    try {
      const status = await checkLinearConnectionStatus();
      setLinearConnected(status.connected);
    } catch {
      setLinearConnected(false);
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    if (open) checkStatus();
  }, [open, checkStatus]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button>
            <Plus className='mr-2 h-4 w-4' />
            New Project
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className='sm:max-w-[440px] p-6 shadow-2xl bg-card'>
        <DialogHeader className='pb-2'>
          <DialogTitle className='flex items-center gap-3 text-xl'>
            <LinkIcon className='h-5 w-5 text-primary' />
            New Project
          </DialogTitle>
          <DialogDescription className='text-muted-foreground text-sm'>
            Import a project from your Linear workspace to start editing issues.
          </DialogDescription>
        </DialogHeader>

        <div className='pt-2 space-y-4'>
          {checking ? (
            <div className='flex items-center justify-center gap-2 py-8 text-muted-foreground'>
              <Loader2 className='h-4 w-4 animate-spin' />
              <span className='text-sm'>Checking Linear connection...</span>
            </div>
          ) : linearConnected ? (
            <div className='space-y-3'>
              <p className='text-sm text-muted-foreground'>
                Select a project from your Linear workspace to import:
              </p>
              <LinearProjectPicker />
            </div>
          ) : (
            <div className='space-y-4 py-4'>
              <div className='flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg'>
                <AlertCircle className='h-4 w-4 text-amber-500 shrink-0 mt-0.5' />
                <div className='text-sm'>
                  <p className='font-medium text-amber-600 dark:text-amber-400'>
                    Linear not connected
                  </p>
                  <p className='text-muted-foreground mt-1'>
                    Connect your Linear account to import projects and sync issues.
                  </p>
                </div>
              </div>
              <ConnectLinearButton
                connected={false}
                className='w-full justify-center'
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
