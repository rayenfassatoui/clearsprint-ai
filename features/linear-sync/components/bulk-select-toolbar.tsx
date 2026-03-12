'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Wand2, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface BulkSelectToolbarProps {
  selectedIds: number[];
  onClearSelection: () => void;
  onRefresh: () => void; // Trigger a local data refresh to show AI changes
}

export function BulkSelectToolbar({
  selectedIds,
  onClearSelection,
  onRefresh,
}: BulkSelectToolbarProps) {
  const [promptOpen, setPromptOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [bulkProgress, setBulkProgress] = useState<{
    total: number;
    completed: number;
    failed: number;
    active: boolean;
    streaming: boolean;
  }>({ total: 0, completed: 0, failed: 0, active: false, streaming: false });

  if (selectedIds.length === 0) return null;

  const handleBulkEdit = async () => {
    if (!prompt.trim() || bulkProgress.active) return;

    setBulkProgress({
      total: selectedIds.length,
      completed: 0,
      failed: 0,
      active: true,
      streaming: true,
    });

    try {
      const response = await fetch('/api/ai/bulk-edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketIds: selectedIds, prompt }),
      });

      if (!response.body) throw new Error('No readable stream');
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let isDone = false;
      while (!isDone) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6);
            if (!dataStr) continue;
            try {
              const payload = JSON.parse(dataStr);
              if (payload.type === 'progress') {
                if (payload.status === 'success') {
                  setBulkProgress((p) => ({
                    ...p,
                    completed: p.completed + 1,
                  }));
                } else if (payload.status === 'error') {
                  setBulkProgress((p) => ({ ...p, failed: p.failed + 1 }));
                }
              } else if (payload.type === 'start') {
                setBulkProgress((p) => ({ ...p, total: payload.total }));
              } else if (payload.type === 'done') {
                isDone = true;
              }
            } catch {
              // Ignore partial chunks
            }
          }
        }
      }

      onRefresh(); // Refresh UI smoothly to show modified items
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : 'Bulk edit failed unexpectedly');
    } finally {
      setBulkProgress((p) => ({ ...p, streaming: false }));
      setTimeout(() => {
        setBulkProgress({
          total: 0,
          completed: 0,
          failed: 0,
          active: false,
          streaming: false,
        });
        onClearSelection();
        setPromptOpen(false);
      }, 2000);
    }
  };

  return (
    <div className='fixed bottom-24 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-xl text-foreground border border-border/50 shadow-2xl rounded-2xl flex flex-col items-center min-w-[400px] z-50 overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300'>
      <div className='flex w-full items-center justify-between gap-3 px-4 py-2 border-b border-border/30 bg-muted/20 font-medium text-sm'>
        <div className='flex items-center gap-2'>
          <span className='flex h-5 items-center justify-center rounded bg-[--linear] px-1.5 text-[11px] font-bold text-white'>
            {selectedIds.length}
          </span>
          <span className='text-muted-foreground'>selected</span>
        </div>
        {promptOpen && (
          <Button
            size='icon'
            variant='ghost'
            className='h-6 w-6 rounded-full text-muted-foreground hover:text-foreground'
            onClick={() => setPromptOpen(false)}
          >
            <X className='w-3 h-3' />
          </Button>
        )}
      </div>

      <div className='flex-1 flex items-center px-2 py-1.5 overflow-hidden transition-all duration-300 relative'>
        {!promptOpen && !bulkProgress.active ? (
          <div className='flex gap-1 w-full p-1 animate-in fade-in zoom-in-95'>
            <Button
              size='sm'
              variant='ghost'
              className='flex-1 hover:bg-purple-500/10 hover:text-purple-600 gap-2'
              onClick={() => setPromptOpen(true)}
            >
              <Wand2 className='w-4 h-4' />
              AI Edit All
            </Button>
            <Button
              size='sm'
              variant='ghost'
              className='flex-1 hover:bg-muted'
              onClick={onClearSelection}
            >
              <X className='w-4 h-4 mr-1.5' />
              Cancel
            </Button>
          </div>
        ) : bulkProgress.active ? (
          <div className='flex items-center justify-between w-full px-3 py-1.5 animate-in fade-in'>
            <span className='text-sm font-medium flex items-center gap-2'>
              {bulkProgress.streaming ? (
                <Loader2 className='w-4 h-4 animate-spin text-purple-500' />
              ) : bulkProgress.failed === 0 ? (
                <CheckCircle2 className='w-4 h-4 text-emerald-500' />
              ) : (
                <AlertCircle className='w-4 h-4 text-rose-500' />
              )}
              {bulkProgress.streaming ? 'Processing...' : 'Done!'}
            </span>
            <div className='text-xs text-muted-foreground flex items-center gap-3 font-mono'>
              <span className='text-emerald-500'>
                {bulkProgress.completed}/{bulkProgress.total} ok
              </span>
              {bulkProgress.failed > 0 && (
                <span className='text-rose-500'>
                  {bulkProgress.failed} failed
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className='flex flex-col w-full p-2 animate-in slide-in-from-bottom-2'>
            <div className='flex w-full gap-2 mb-2'>
              <Input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder='e.g. Set priority to High'
                className='h-10 text-sm focus-visible:ring-purple-500 bg-muted/40 border-border/50 rounded-xl'
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleBulkEdit();
                  if (e.key === 'Escape') setPromptOpen(false);
                }}
              />
              <Button
                size='sm'
                className='h-10 shrink-0 bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-4'
                onClick={handleBulkEdit}
              >
                Apply
              </Button>
            </div>
            <div className='flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide px-1'>
              {['Mark Done', 'Set High Priority', 'Cancel tickets'].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setPrompt(suggestion)}
                  className='text-xs whitespace-nowrap px-3 py-1.5 rounded-lg bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors border border-border/50'
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
