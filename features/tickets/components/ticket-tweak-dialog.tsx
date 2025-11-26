'use client';

import { Loader2, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { tweakTicket } from '@/features/projects/actions/generate.server';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface TicketTweakDialogProps {
  ticketId: number;
  onSuccess: () => void;
  trigger?: React.ReactNode;
}

export function TicketTweakDialog({
  ticketId,
  onSuccess,
  trigger,
}: TicketTweakDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTweak = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const result = await tweakTicket(ticketId, prompt);
      if (result.success) {
        toast.success('Ticket updated successfully!');
        setIsOpen(false);
        setPrompt('');
        onSuccess();
      } else {
        toast.error(result.error);
      }
    } catch (_error) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <Sparkles className="h-3 w-3" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>AI Tweak</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Textarea
            placeholder='How should this ticket be changed? (e.g., "Make the description more technical" or "Add acceptance criteria")'
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[100px]"
          />
          <Button
            className="w-full"
            onClick={handleTweak}
            disabled={loading || !prompt.trim()}
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            {loading ? 'Tweaking...' : 'Apply Tweak'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
