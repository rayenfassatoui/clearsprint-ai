'use client';

import { WorkspaceTicketCard } from './workspace-ticket-card';
import type { WorkspaceTicket } from '@/lib/types';

interface WorkspaceListViewProps {
  tickets: WorkspaceTicket[];
  selectedIds: number[];
  onToggleSelect: (id: number) => void;
  onClick: (ticket: WorkspaceTicket) => void;
}

export function WorkspaceListView({
  tickets,
  selectedIds,
  onToggleSelect,
  onClick,
}: WorkspaceListViewProps) {
  if (tickets.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center p-12 text-muted-foreground bg-card/10 rounded-xl border border-dashed border-border/50'>
        <p className='text-sm font-medium'>No tickets found</p>
      </div>
    );
  }

  // Simple list layout for now
  return (
    <div className='grid gap-3 pt-4 pb-12'>
      {tickets.map((ticket) => (
        <WorkspaceTicketCard
          key={ticket.id}
          ticket={ticket}
          isSelected={selectedIds.includes(ticket.id)}
          onToggleSelect={onToggleSelect}
          onClick={() => onClick(ticket)}
        />
      ))}
    </div>
  );
}
