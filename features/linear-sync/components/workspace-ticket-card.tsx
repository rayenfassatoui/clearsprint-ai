'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import type { WorkspaceTicket } from '@/lib/types';
import {
  SYNC_STATUS_LABELS,
  SYNC_STATUS_STYLES,
  getDisplayData,
  getPriorityMeta,
} from '../utils/status';

interface WorkspaceTicketCardProps {
  ticket: WorkspaceTicket;
  isSelected: boolean;
  onToggleSelect: (id: number) => void;
  onClick: (ticket: WorkspaceTicket) => void;
}

export function WorkspaceTicketCard({
  ticket,
  isSelected,
  onToggleSelect,
  onClick,
}: WorkspaceTicketCardProps) {
  const statusBadge = ticket.syncStatus;
  const data = getDisplayData(ticket);
  const isRemoteDeleted = statusBadge === 'remote_deleted';

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
    <Card
      onClick={() => !isRemoteDeleted && onClick(ticket)}
      className={`group relative p-4 transition-all duration-200 bg-card ${
        isRemoteDeleted
          ? 'opacity-60 cursor-not-allowed border-red-500/20'
          : 'cursor-pointer hover:shadow-md hover:scale-[1.01] hover:z-10'
      } ${
        isSelected
          ? 'ring-2 ring-[--linear] border-transparent shadow-[--linear]/10'
          : isRemoteDeleted
            ? ''
            : 'border-border/50 hover:border-[--linear]/40'
      }`}
    >
      {isRemoteDeleted && (
        <div className='absolute inset-0 rounded-lg bg-red-500/3 pointer-events-none' />
      )}

      <div className='flex gap-3 items-start'>
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggleSelect(ticket.id)}
          className='mt-1 transition-opacity opacity-0 group-hover:opacity-100 data-[state=checked]:opacity-100'
          onClick={(e) => e.stopPropagation()}
          disabled={isRemoteDeleted}
        />

        <div className='flex-1 space-y-2.5 min-w-0'>
          <div className='flex justify-between items-start gap-2'>
            <div className='flex items-center gap-2 font-mono text-xs text-muted-foreground font-medium'>
              <span className='bg-[--linear]/10 text-[--linear] px-1.5 py-0.5 rounded-sm font-bold'>
                {identifier}
              </span>
              {statusBadge !== 'synced' && (
                <Badge
                  variant='outline'
                  className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0 rounded ${SYNC_STATUS_STYLES[statusBadge]}`}
                >
                  {SYNC_STATUS_LABELS[statusBadge]}
                </Badge>
              )}
            </div>

            {/* Priority indicator */}
            <div
              className={`flex items-center gap-1 text-[10px] font-semibold shrink-0 ${priorityMeta.color}`}
              title={priorityMeta.label}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${priorityMeta.dotColor}`}
              />
              <span className='hidden sm:inline'>{priorityMeta.label}</span>
            </div>
          </div>

          <p
            className={`text-sm font-semibold leading-snug line-clamp-2 transition-colors ${
              isRemoteDeleted
                ? 'line-through text-muted-foreground'
                : 'text-foreground group-hover:text-[--linear]'
            }`}
          >
            {title}
          </p>

          {/* Status pill */}
          {data?.statusName && (
            <span className='inline-flex text-[10px] font-medium text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full'>
              {data.statusName}
            </span>
          )}

          {/* Labels */}
          {data?.labels && data.labels.length > 0 && (
            <div className='flex flex-wrap gap-1.5'>
              {data.labels.map((label: string) => (
                <span
                  key={label}
                  className='inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-muted/50 text-muted-foreground border border-border/40'
                >
                  {label}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
