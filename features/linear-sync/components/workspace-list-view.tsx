'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import type { WorkspaceTicket } from '@/lib/types';
import {
  SYNC_STATUS_LABELS,
  SYNC_STATUS_STYLES,
  getDisplayData,
  getPriorityMeta,
} from '../utils/status';

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
              const priorityMeta = getPriorityMeta(priority);

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

                  {/* Title */}
                  <td className={`p-4 truncate max-w-sm whitespace-normal ${isRemoteDeleted ? 'line-through text-muted-foreground' : 'font-medium'}`}>
                    <div className="line-clamp-2">
                      {title}
                    </div>
                  </td>

                  {/* Status */}
                  <td className='p-4'>
                     {data?.statusName ? (
                      <span className='inline-flex text-[11px] font-medium text-muted-foreground bg-muted/60 border border-border/40 px-2 py-0.5 rounded-full'>
                        {data.statusName}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>

                  {/* Priority */}
                  <td className='p-4'>
                    <div className={`flex items-center gap-1.5 text-xs font-semibold ${priorityMeta.color}`} title={priorityMeta.label}>
                      <span className={`w-1.5 h-1.5 rounded-full ${priorityMeta.dotColor}`} />
                      <span>{priorityMeta.label}</span>
                    </div>
                  </td>

                  {/* Estimate */}
                  <td className='p-4 text-muted-foreground text-xs'>
                     {data?.estimate != null ? `${data.estimate} pts` : '-'}
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
