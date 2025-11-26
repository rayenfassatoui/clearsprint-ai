'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus, Settings } from 'lucide-react';
import { ImportJiraForm } from '@/features/jira/components/import-jira-form';
import Link from 'next/link';

interface CreateProjectDialogProps {
  jiraConnected: boolean;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CreateProjectDialog({
  jiraConnected,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: CreateProjectDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? controlledOnOpenChange : setInternalOpen;

  const handleOpenChange = (newOpen: boolean) => {
    setOpen?.(newOpen);
  };

  const handleSuccess = () => {
    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-none shadow-2xl bg-card">
        <div className="h-2 w-full bg-linear-to-r from-blue-500 to-cyan-500" />
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Settings className="h-6 w-6 text-blue-500" />
            </div>
            Import from Jira
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 pt-2">
          {jiraConnected ? (
            <ImportJiraForm
              onSuccess={handleSuccess}
              onCancel={() => handleOpenChange(false)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-6 bg-muted/30 rounded-xl border border-dashed border-muted-foreground/25 mx-1">
              <div className="bg-background p-4 rounded-full shadow-sm ring-1 ring-border">
                <Settings className="h-10 w-10 text-muted-foreground" />
              </div>
              <div className="space-y-2 max-w-sm">
                <h3 className="font-semibold text-xl">Jira Not Connected</h3>
                <p className="text-muted-foreground text-sm">
                  To create a project, you must first connect your Jira
                  workspace. This allows for seamless two-way synchronization.
                </p>
              </div>
              <Link href="/dashboard/integration">
                <Button size="lg" className="gap-2">
                  <Settings className="w-4 h-4" />
                  Connect Jira Workspace
                </Button>
              </Link>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
