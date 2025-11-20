'use client';

import { Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { generateBacklog } from '@/actions/generate.server';
import { GenerationLoadingState } from '@/components/generation-loading-state';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface GenerateButtonProps {
  projectId: number;
  className?: string;
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link';
}

export function GenerateButton({
  projectId,
  className,
  variant = 'secondary',
}: GenerateButtonProps) {
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const router = useRouter();

  const handleGenerate = async () => {
    setStatus('loading');
    try {
      // Simulate steps for better UX (optional, but good for feeling)
      // In a real app, we might stream status updates

      const result = await generateBacklog(projectId);

      if (result.success) {
        setStatus('success');
        toast.success('Backlog generated successfully!');
        // Wait a bit for the success animation
        setTimeout(() => {
          setStatus('idle');
          router.refresh();
        }, 1500);
      } else {
        setStatus('error');
        toast.error(result.error);
        setTimeout(() => setStatus('idle'), 2000);
      }
    } catch (error) {
      setStatus('error');
      toast.error('An unexpected error occurred');
      setTimeout(() => setStatus('idle'), 2000);
    }
  };

  return (
    <>
      <GenerationLoadingState status={status} />
      <Button
        variant={variant}
        size={variant === 'default' ? 'lg' : 'sm'}
        onClick={handleGenerate}
        disabled={status === 'loading'}
        className={cn(
          'transition-all duration-300 hover:bg-primary hover:text-primary-foreground',
          className,
        )}
      >
        <Sparkles
          className={cn('mr-2', variant === 'default' ? 'h-5 w-5' : 'h-4 w-4')}
        />
        Generate
      </Button>
    </>
  );
}
