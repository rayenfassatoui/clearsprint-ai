'use client';

import { Badge } from '@/components/ui/badge';
import type { TicketDiff } from '../types';
import { ArrowRight, Minus, Plus } from 'lucide-react';
import { DIFF_FIELD_LABELS } from '../utils/diff';
import { getPriorityMeta } from '../utils/status';

interface DiffFieldViewerProps {
  diff: TicketDiff;
}

function renderScalarValue(val: unknown, field: string): React.ReactNode {
  if (val === null || val === undefined || val === '') {
    return <span className='text-muted-foreground italic text-xs'>empty</span>;
  }
  if (field === 'priority') {
    const meta = getPriorityMeta(val as number);
    return (
      <span className={`font-semibold text-xs ${meta.color}`}>
        {meta.label}
      </span>
    );
  }
  if (field === 'estimate') {
    return (
      <span>
        {val as number} pt{(val as number) !== 1 ? 's' : ''}
      </span>
    );
  }
  if (field === 'dueDate') {
    const date = new Date(val as string);
    return (
      <span>
        {Number.isNaN(date.getTime()) ? String(val) : date.toLocaleDateString()}
      </span>
    );
  }
  return <span>{String(val)}</span>;
}

export function DiffFieldViewer({ diff }: DiffFieldViewerProps) {
  const { field, oldValue, newValue } = diff;
  const fieldLabel = DIFF_FIELD_LABELS[field as string] || field;

  // ── Labels (array of strings) ───────────────────────────────────────────────
  if (field === 'labels') {
    const oldLabels: string[] = Array.isArray(oldValue) ? oldValue : [];
    const newLabels: string[] = Array.isArray(newValue) ? newValue : [];
    const removed = oldLabels.filter((l) => !newLabels.includes(l));
    const added = newLabels.filter((l) => !oldLabels.includes(l));
    const kept = oldLabels.filter((l) => newLabels.includes(l));

    return (
      <div className='flex flex-col gap-1.5 py-1 text-sm border-l-2 border-border/50 pl-3'>
        <span className='font-semibold text-[10px] text-muted-foreground uppercase tracking-wider'>
          {fieldLabel}
        </span>
        <div className='flex flex-wrap gap-1.5 mt-1'>
          {kept.map((l) => (
            <Badge
              key={l}
              variant='outline'
              className='text-[10px] text-muted-foreground'
            >
              {l}
            </Badge>
          ))}
          {removed.map((l) => (
            <Badge
              key={l}
              variant='outline'
              className='text-[10px] bg-red-500/10 text-red-600 border-red-500/20 line-through'
            >
              <Minus className='w-2.5 h-2.5 mr-1' />
              {l}
            </Badge>
          ))}
          {added.map((l) => (
            <Badge
              key={l}
              variant='outline'
              className='text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
            >
              <Plus className='w-2.5 h-2.5 mr-1' />
              {l}
            </Badge>
          ))}
        </div>
      </div>
    );
  }

  // ── Description (long text side-by-side) ────────────────────────────────────
  if (field === 'description') {
    return (
      <div className='flex flex-col gap-1.5 py-1 text-sm border-l-2 border-border/50 pl-3'>
        <span className='font-semibold text-[10px] text-muted-foreground uppercase tracking-wider'>
          {fieldLabel}
        </span>
        <div className='grid grid-cols-2 gap-4 mt-1'>
          <div className='bg-red-500/5 text-red-600 p-2 rounded-md border border-red-500/10 whitespace-pre-wrap max-h-40 overflow-y-auto font-mono text-xs opacity-70'>
            {renderScalarValue(oldValue, field)}
          </div>
          <div className='bg-emerald-500/5 text-emerald-600 p-2 rounded-md border border-emerald-500/10 whitespace-pre-wrap max-h-40 overflow-y-auto font-mono text-xs'>
            {renderScalarValue(newValue, field)}
          </div>
        </div>
      </div>
    );
  }

  // ── Scalar fields (single-line transition) ───────────────────────────────────
  return (
    <div className='flex flex-col gap-1 py-1 text-sm border-l-2 border-border/50 pl-3'>
      <span className='font-semibold text-[10px] text-muted-foreground uppercase tracking-wider'>
        {fieldLabel}
      </span>
      <div className='flex items-center gap-3 mt-0.5 flex-wrap'>
        {diff.changeType !== 'added' && (
          <span className='text-muted-foreground line-through opacity-70 truncate max-w-[200px]'>
            {renderScalarValue(oldValue, field as string)}
          </span>
        )}
        {diff.changeType === 'modified' && (
          <ArrowRight className='w-3.5 h-3.5 text-muted-foreground/50 shrink-0' />
        )}
        <span className='text-emerald-500 font-medium truncate max-w-[200px] bg-emerald-500/10 px-1.5 py-0.5 rounded'>
          {renderScalarValue(newValue, field as string)}
        </span>
      </div>
    </div>
  );
}
