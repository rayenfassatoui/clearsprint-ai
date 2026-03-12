'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import type { WorkspaceTicket } from '@/lib/types';
import {
  SYNC_STATUS_LABELS,
  SYNC_STATUS_STYLES,
  getDisplayData,
} from '../utils/status';
import { InlineStatusPicker } from './inline-status-picker';
import { InlinePriorityPicker } from './inline-priority-picker';
import { InlineEstimatePicker } from './inline-estimate-picker';
import { EmptyState } from './empty-state';
import { updateTicketDraft } from '../actions/tickets.server';
import { toast } from 'sonner';
import { LayoutDashboard, Sparkles } from 'lucide-react';

interface WorkspaceListViewProps {
  tickets: WorkspaceTicket[];
  selectedIds: number[];
  onToggleSelect: (id: number) => void;
  onClick: (ticket: WorkspaceTicket) => void;
  onUpdateTicket: (ticket: WorkspaceTicket) => void;
}

export function WorkspaceListView({
  tickets,
  selectedIds,
  onToggleSelect,
  onClick,
  onUpdateTicket,
}: WorkspaceListViewProps) {
  const handleInlineUpdate = async (ticket: WorkspaceTicket, draftPatch: Record<string, unknown>) => {
    const optimisticTicket = {
      ...ticket,
      draftData: {
        ...(ticket.draftData as Record<string, unknown> | null),
        ...draftPatch,
      },
      syncStatus: ticket.syncStatus === 'synced' ? 'modified' : ticket.syncStatus,
    } as WorkspaceTicket;
    
    onUpdateTicket(optimisticTicket);

    const res = await updateTicketDraft(ticket.id, draftPatch);
    if (res.success && res.data) {
      onUpdateTicket(res.data);
    } else {
      toast.error(res.error || 'Failed to update ticket');
      onUpdateTicket(ticket); // revert
    }
  };

  if (tickets.length === 0) {
    return (
      <EmptyState
        icon={LayoutDashboard}
        title='No tickets found'
        description='Try adjusting your filters or search query. If the project is new, sync from Linear to load tickets.'
      />
    );
  }

  return (
    <div className='rounded-xl border border-border/50 bg-card overflow-hidden mt-4 pb-24 shadow-xs'>
      <div className='overflow-x-auto'>
        <table className='w-full text-sm text-left whitespace-nowrap'>
          <thead className='text-xs text-muted-foreground uppercase bg-muted/30 border-b border-border/50'>
            <tr>
              <th className='p-4 w-12 text-center pointer-events-none'>
                <span className="sr-only">Select</span>
              </th>
              <th className='p-4 font-semibold w-24'>Identifier</th>
              <th className='p-4 font-semibold min-w-[300px] w-full'>Title</th>
              <th className='p-4 font-semibold w-8 text-center'><span className='sr-only'>AI</span></th>
              <th className='p-4 font-semibold w-32'>Status</th>
              <th className='p-4 font-semibold w-32'>Priority</th>
              <th className='p-4 font-semibold w-32'>Estimate</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-border/50'>
            {tickets.map((ticket) => {
              const statusBadge = ticket.syncStatus;
              const data = getDisplayData(ticket);
              const isRemoteDeleted = statusBadge === 'remote_deleted';
              const isSelected = selectedIds.includes(ticket.id);

              const title =
                statusBadge === 'new_local'
                  ? ((ticket.draftData as Record<string, unknown>)?.title as string)
                  : data?.title;

              const identifier =
                ticket.linearIdentifier ||
                ((ticket.draftData as Record<string, unknown>)?.identifier as string) ||
                'NEW';

              const priority = data?.priority ?? 0;

              return (
                <tr
                  key={ticket.id}
                  onClick={() => !isRemoteDeleted && onClick(ticket)}
                  className={`group transition-colors ${
                    isRemoteDeleted
                      ? 'bg-red-500/5 opacity-60 cursor-not-allowed'
                      : 'hover:bg-muted/30 cursor-pointer'
                  } ${isSelected && !isRemoteDeleted ? 'bg-[--linear]/5' : ''}`}
                >
                  <td className='p-4 text-center' onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => onToggleSelect(ticket.id)}
                      disabled={isRemoteDeleted}
                      className={isSelected ? 'opacity-100' : 'opacity-50 group-hover:opacity-100'}
                    />
                  </td>
                  
                  {/* Identifier & Sync Status */}
                  <td className='p-4 font-mono text-xs'>
                    <div className='flex flex-col justify-center items-start gap-1.5'>
                      <span className='bg-[--linear]/10 text-[--linear] px-1.5 py-0.5 rounded-sm font-bold'>
                        {identifier}
                      </span>
                      {statusBadge !== 'synced' && (
                        <Badge
                          variant='outline'
                          className={`text-[9px] uppercase font-bold tracking-wider px-1 py-0 rounded ${SYNC_STATUS_STYLES[statusBadge]}`}
                        >
                          {SYNC_STATUS_LABELS[statusBadge]}
                        </Badge>
                      )}
                    </div>
                  </td>

                  {/* Title + AI indicator */}
                  <td className={`p-4 truncate max-w-sm whitespace-normal ${isRemoteDeleted ? 'line-through text-muted-foreground' : 'font-medium'}`}>
                    <div className="line-clamp-2">
                      {title}
                    </div>
                  </td>

                  {/* AI Provenance Indicator */}
                  <td className='p-4 text-center' onClick={(e) => e.stopPropagation()}>
                    {ticket.draftData !== null && statusBadge !== 'new_local' && (
                      <span
                        title='Modified by AI'
                        className='inline-flex items-center justify-center h-5 w-5 rounded-full bg-[--linear]/10 text-[--linear]'
                      >
                        <Sparkles className='w-3 h-3' />
                      </span>
                    )}
                  </td>

                  <td className='p-4' onClick={(e) => e.stopPropagation()}>
                    <InlineStatusPicker
                      statusName={data?.statusName || 'Todo'}
                      disabled={isRemoteDeleted}
                      onUpdate={(newStatus) => handleInlineUpdate(ticket, { statusName: newStatus })}
                    />
                  </td>

                  {/* Priority */}
                  <td className='p-4' onClick={(e) => e.stopPropagation()}>
                    <InlinePriorityPicker
                      priority={priority}
                      disabled={isRemoteDeleted}
                      onUpdate={(newPriority) => handleInlineUpdate(ticket, { priority: newPriority })}
                    />
                  </td>

                  {/* Estimate */}
                  <td className='p-4' onClick={(e) => e.stopPropagation()}>
                    <InlineEstimatePicker
                      estimate={data?.estimate ?? null}
                      disabled={isRemoteDeleted}
                      onUpdate={(newEstimate) => handleInlineUpdate(ticket, { estimate: newEstimate })}
                    />
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
