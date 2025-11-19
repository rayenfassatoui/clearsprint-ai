'use client';

import { Loader2, RefreshCw, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { generateBacklog } from '@/actions/generate.server';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { Textarea } from '@/components/ui/textarea';

interface GeneralAiEditDialogProps {
  projectId: number;
  trigger?: React.ReactNode;
  tooltip?: string;
}

export function GeneralAiEditDialog({ projectId, trigger, tooltip }: GeneralAiEditDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const router = useRouter();

  const handleRefineAll = async () => {
    setLoading(true);
    try {
      const result = await generateBacklog(projectId, prompt);

      if (result.success) {
        toast.success('Project refined successfully!');
        setIsOpen(false);
        setPrompt('');
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const triggerButton = trigger ? (
    trigger
  ) : (
    <Button variant="outline" size="sm" className="ml-2">
      <Sparkles className="mr-2 h-4 w-4" />
      General AI Edit
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {tooltip ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <DialogTrigger asChild>
                {triggerButton}
              </DialogTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <DialogTrigger asChild>
          {triggerButton}
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>General AI Edit (Auto Pilot)</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <p className="text-muted-foreground text-sm">
            Describe how you want to change the entire backlog. The AI will regenerate tickets based on your instructions and the original document.
          </p>
          <Textarea
            placeholder="e.g., 'Make all user stories follow the Gherkin syntax' or 'Focus more on security requirements'"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[100px]"
          />
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md border border-yellow-200 dark:border-yellow-800">
            <p className="text-xs text-yellow-800 dark:text-yellow-200 flex items-center">
              <RefreshCw className="w-3 h-3 mr-2" />
              Warning: This will regenerate all tickets. Existing manual edits might be lost.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleRefineAll} disabled={loading}>
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            {loading ? 'Refining...' : 'Start Auto Pilot'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
