'use client';

import { useMemo } from 'react';
import { WorkspaceTicketCard } from './workspace-ticket-card';
import type { WorkspaceTicket } from '@/lib/types';
import { getDisplayData, getKanbanAccent } from '../utils/status';
import { cn } from '@/lib/utils';

interface WorkspaceKanbanViewProps {
  tickets: WorkspaceTicket[];
  selectedIds: number[];
  onToggleSelect: (id: number) => void;
  onClick: (ticket: WorkspaceTicket) => void;
}

const COLUMN_ORDER = [
  'Backlog',
  'Todo',
  'In Progress',
  'In Review',
  'Done',
  'Canceled',
];

export function WorkspaceKanbanView({
  tickets,
  selectedIds,
  onToggleSelect,
  onClick,
}: WorkspaceKanbanViewProps) {
  const columns = useMemo(() => {
    const cols: Record<string, WorkspaceTicket[]> = {
      Backlog: [],
      Todo: [],
      'In Progress': [],
      'In Review': [],
      Done: [],
      Canceled: [],
    };

    for (const t of tickets) {
      const data = getDisplayData(t);
      const status = data?.statusName || 'Backlog';
      if (!cols[status]) cols[status] = [];
      cols[status].push(t);
    }

    // Remove empty columns that aren't the core three
    for (const k of Object.keys(cols)) {
      if (
        cols[k].length === 0 &&
        !['Todo', 'In Progress', 'Done'].includes(k)
      ) {
        delete cols[k];
      }
    }

    // Sort columns: known first, then unknowns
    const sorted: Record<string, WorkspaceTicket[]> = {};
    for (const k of COLUMN_ORDER) {
      if (k in cols) sorted[k] = cols[k];
    }
    for (const k of Object.keys(cols)) {
      if (!(k in sorted)) sorted[k] = cols[k];
    }
    return sorted;
  }, [tickets]);

  return (
    <div className='flex gap-4 overflow-x-auto pb-8 pt-4 min-h-[500px]'>
      {Object.entries(columns).map(([status, list]) => (
        <div
          key={status}
          className={cn(
            'shrink-0 w-[300px] bg-muted/20 border border-t-2 border-border/50 rounded-xl p-3 flex flex-col',
            getKanbanAccent(status),
          )}
        >
          <div className='flex items-center justify-between mb-4 px-1'>
            <h3 className='font-semibold text-sm tracking-tight'>{status}</h3>
            <span className='text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-medium tabular-nums'>
              {list.length}
            </span>
          </div>

          <div className='flex-1 space-y-3 overflow-y-auto pr-1'>
            {list.map((ticket) => (
              <WorkspaceTicketCard
                key={ticket.id}
                ticket={ticket}
                isSelected={selectedIds.includes(ticket.id)}
                onToggleSelect={onToggleSelect}
                onClick={() => onClick(ticket)}
              />
            ))}
            {list.length === 0 && (
              <div className='h-24 w-full flex items-center justify-center border-2 border-dashed border-border/40 rounded-lg text-xs text-muted-foreground/50 font-medium select-none'>
                No tickets
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
