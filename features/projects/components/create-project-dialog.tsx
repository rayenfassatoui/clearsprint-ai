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
import { Plus, FileText, ArrowRight } from 'lucide-react';
import { ImportJiraForm } from '@/features/jira/components/import-jira-form';
import { CreateProjectForm } from '@/features/projects/components/create-project-form';
import { cn } from '@/lib/utils';

// Jira icon component for the selection card
function JiraIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M11.53 12.53L2.47 21.59C2.16 21.9 1.65 21.9 1.34 21.59L0.41 20.66C0.1 20.35 0.1 19.84 0.41 19.53L9.47 10.47C9.78 10.16 10.29 10.16 10.6 10.47L11.53 11.41C11.84 11.72 11.84 12.22 11.53 12.53ZM12.47 11.59L21.53 2.53C21.84 2.22 22.35 2.22 22.66 2.53L23.59 3.47C23.9 3.78 23.9 4.29 23.59 4.6L14.53 13.66C14.22 13.97 13.71 13.97 13.4 13.66L12.47 12.72C12.16 12.41 12.16 11.9 12.47 11.59ZM12.47 2.53L21.53 11.59C21.84 11.9 21.84 12.41 21.53 12.72L20.6 13.66C20.29 13.97 19.78 13.97 19.47 13.66L10.41 4.6C10.1 4.29 10.1 3.78 10.41 3.47L11.34 2.53C11.65 2.22 12.16 2.22 12.47 2.53Z"
        fill="currentColor"
      />
    </svg>
  );
}

type Step = 'selection' | 'prd' | 'jira';

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
  const [step, setStep] = useState<Step>('selection');

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? controlledOnOpenChange : setInternalOpen;

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset step when closing
      setTimeout(() => setStep('selection'), 300);
    }
    setOpen?.(newOpen);
  };

  const handleSuccess = () => {
    handleOpenChange(false);
  };

  const renderContent = () => {
    if (step === 'selection') {
      return (
        <div className="grid gap-4 py-4">
          <button
            type="button"
            onClick={() => setStep('prd')}
            className="flex items-start gap-4 p-4 rounded-xl border border-muted bg-card hover:bg-accent/50 hover:border-primary/20 transition-all text-left group"
          >
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-base mb-1 flex items-center">
                Import PRD
                <ArrowRight className="h-4 w-4 ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </h3>
              <p className="text-sm text-muted-foreground">
                Upload a PDF or text file to generate a backlog automatically
                with AI.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setStep('jira')}
            disabled={!jiraConnected}
            className={cn(
              'flex items-start gap-4 p-4 rounded-xl border border-muted bg-card transition-all text-left group',
              jiraConnected
                ? 'hover:bg-accent/50 hover:border-blue-500/20 cursor-pointer'
                : 'opacity-60 cursor-not-allowed',
            )}
          >
            <div
              className={cn(
                'h-10 w-10 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                jiraConnected
                  ? 'bg-blue-500/10 group-hover:bg-blue-500/20'
                  : 'bg-muted',
              )}
            >
              <JiraIcon
                className={cn(
                  'h-5 w-5',
                  jiraConnected ? 'text-blue-500' : 'text-muted-foreground',
                )}
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-base flex items-center">
                  Import from Jira
                  {jiraConnected && (
                    <ArrowRight className="h-4 w-4 ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  )}
                </h3>
                {!jiraConnected && (
                  <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                    Not Connected
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Sync an existing Jira project for two-way synchronization and AI
                editing.
              </p>
            </div>
          </button>
        </div>
      );
    }

    if (step === 'prd') {
      return (
        <div className="py-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStep('selection')}
            className="mb-4 -ml-2 h-8 text-muted-foreground hover:text-foreground"
          >
            ← Back to options
          </Button>
          <CreateProjectForm onSuccess={handleSuccess} />
        </div>
      );
    }

    if (step === 'jira') {
      return (
        <div className="py-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStep('selection')}
            className="mb-4 -ml-2 h-8 text-muted-foreground hover:text-foreground"
          >
            ← Back to options
          </Button>
          <ImportJiraForm
            onSuccess={handleSuccess}
            onCancel={() => setStep('selection')}
          />
        </div>
      );
    }
  };

  const getTitle = () => {
    switch (step) {
      case 'selection':
        return 'Create New Project';
      case 'prd':
        return 'Upload PRD';
      case 'jira':
        return 'Import from Jira';
    }
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
