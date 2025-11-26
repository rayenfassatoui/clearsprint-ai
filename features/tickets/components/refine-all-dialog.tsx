'use client';

import { Loader2, Sparkles, Lightbulb, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { refineBacklog } from '@/features/tickets/actions/ai-edit.server';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from '@/components/ui/progress';

interface GeneralAiEditDialogProps {
  projectId: number;
  trigger?: React.ReactNode;
  tooltip?: string;
}

const EXAMPLE_PROMPTS = [
  'Add acceptance criteria to all tasks',
  'Make descriptions more technical and detailed',
  'Add time estimates to each ticket',
  'Include security considerations in all tasks',
  'Add testing requirements to tasks',
  'Format all descriptions with markdown',
];

const MAX_CHARS = 500;

export function GeneralAiEditDialog({
  projectId,
  trigger,
  tooltip,
}: GeneralAiEditDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [progress, setProgress] = useState(0);
  const router = useRouter();

  const charCount = prompt.length;
  const charPercentage = (charCount / MAX_CHARS) * 100;
  const isOverLimit = charCount > MAX_CHARS;

  const handleRefineAll = async () => {
    if (!prompt.trim() || isOverLimit) return;

    setLoading(true);
    setProgress(0);

    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 500);

    try {
      const result = await refineBacklog(projectId, prompt);

      clearInterval(progressInterval);
      setProgress(100);

      if (result.success) {
        // Show success animation briefly before closing
        await new Promise((resolve) => setTimeout(resolve, 500));
        toast.success(`Refined ${result.updatedCount} tickets successfully!`, {
          icon: <CheckCircle2 className="h-4 w-4" />,
          duration: 4000,
        });
        setIsOpen(false);
        setPrompt('');
        setProgress(0);
        router.refresh();
      } else {
        setProgress(0);
        toast.error(result.error || 'Failed to refine backlog');
      }
    } catch {
      clearInterval(progressInterval);
      setProgress(0);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectExample = (example: string) => {
    setPrompt(example);
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
              <DialogTrigger asChild>{triggerButton}</DialogTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <DialogTrigger asChild>{triggerButton}</DialogTrigger>
      )}

      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle>AI-Powered Refinement</DialogTitle>
              <DialogDescription>
                Refine all tickets in this project. The AI will strictly follow
                your instructions.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Example Prompts Dropdown */}
          <div className="flex items-center justify-between">
            <label htmlFor="ai-prompt-input" className="text-sm font-medium">
              Your instruction
            </label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Examples
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[300px]">
                <DropdownMenuLabel>Example Prompts</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {EXAMPLE_PROMPTS.map((example) => (
                  <DropdownMenuItem
                    key={example}
                    onClick={() => handleSelectExample(example)}
                    className="cursor-pointer"
                  >
                    <span className="text-sm">{example}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Textarea with Animation */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Textarea
              id="ai-prompt-input"
              placeholder="E.g., 'Add acceptance criteria to all tasks' or 'Make descriptions more detailed'"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[120px] resize-none"
              disabled={loading}
            />
          </motion.div>

          {/* Character Counter */}
          <div className="flex items-center justify-between text-xs">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2"
            >
              <span
                className={`font-medium ${
                  isOverLimit
                    ? 'text-red-500'
                    : charPercentage > 80
                      ? 'text-orange-500'
                      : 'text-muted-foreground'
                }`}
              >
                {charCount} / {MAX_CHARS}
              </span>
              {isOverLimit && (
                <span className="text-red-500">Character limit exceeded</span>
              )}
            </motion.div>
          </div>

          {/* Progress Bar (shown during loading) */}
          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Refining tickets...
                  </span>
                  <span className="font-medium">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleRefineAll}
            disabled={!prompt.trim() || isOverLimit || loading}
            className="gap-2 min-w-[140px] relative overflow-hidden group"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Refining...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span className="relative z-10">Refine Backlog</span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
