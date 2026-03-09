'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sparkles, Loader2, Target, SplitSquareHorizontal } from 'lucide-react';

const QUICK_PROMPTS: Record<'edit' | 'subtasks', string[]> = {
  edit: [
    'Make description more concise',
    'Set priority to High',
    'Rewrite as a user story',
  ],
  subtasks: [
    'Break into 3 technical tasks',
    'Add testing subtask',
    'Create frontend and backend subtasks',
  ],
};

interface AiPromptBarProps {
  onApply: (prompt: string, type: 'edit' | 'subtasks') => Promise<void>;
  loading: boolean;
  error?: string | null;
}

export function AiPromptBar({ onApply, loading, error }: AiPromptBarProps) {
  const [prompt, setPrompt] = useState('');
  const [opType, setOpType] = useState<'edit' | 'subtasks'>('edit');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;
    try {
      await onApply(prompt.trim(), opType);
      setPrompt('');
    } catch (err) {
      // Error surfaced via the `error` prop from parent
      console.error('AI prompt failed:', err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') setPrompt('');
  };

  return (
    <div className='flex flex-col gap-2 p-4 bg-muted/20 border-t border-border/40 shrink-0'>
      {error && (
        <p className='text-xs text-rose-500 font-medium px-1'>{error}</p>
      )}

      <form onSubmit={handleSubmit} className='flex items-center gap-2'>
        <Select
          value={opType}
          onValueChange={(v) => setOpType(v as 'edit' | 'subtasks')}
          disabled={loading}
        >
          <SelectTrigger className='w-[140px] bg-background/50 h-9 shrink-0 gap-2 border-border/50'>
            {opType === 'edit' ? (
              <Target className='w-3.5 h-3.5 text-purple-500' />
            ) : (
              <SplitSquareHorizontal className='w-3.5 h-3.5 text-sky-500' />
            )}
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='edit' className='cursor-pointer'>
              Edit Ticket
            </SelectItem>
            <SelectItem value='subtasks' className='cursor-pointer'>
              Sub-tasks
            </SelectItem>
          </SelectContent>
        </Select>

        <div className='relative flex-1'>
          <Sparkles className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-500/70 pointer-events-none' />
          <Input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            placeholder={
              opType === 'edit'
                ? 'e.g. Set priority to High and mark as In Progress'
                : 'e.g. Break this task into 3 manageable chunks'
            }
            className='pl-9 h-9 border-border/50 bg-background/50 focus-visible:ring-purple-500/30 w-full font-medium'
          />
        </div>

        <Button
          type='submit'
          disabled={loading || !prompt.trim()}
          size='sm'
          className='bg-purple-600 hover:bg-purple-700 text-white shrink-0 h-9 transition-colors gap-2'
        >
          {loading ? (
            <Loader2 className='w-3.5 h-3.5 animate-spin' />
          ) : (
            <span>Apply</span>
          )}
        </Button>
      </form>

      {/* Quick prompt chips */}
      {!loading && (
        <div className='flex flex-wrap gap-1.5 px-1'>
          {QUICK_PROMPTS[opType].map((chip) => (
            <button
              key={chip}
              type='button'
              onClick={() => setPrompt(chip)}
              className='text-[10px] font-medium px-2 py-0.5 rounded-full border border-border/50 bg-muted/30 text-muted-foreground hover:bg-[--linear]/10 hover:text-[--linear] hover:border-[--linear]/30 transition-colors cursor-pointer'
            >
              {chip}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
