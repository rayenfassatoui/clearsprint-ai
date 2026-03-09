'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import {
  Loader2,
  Plus,
  PenSquare,
  ArrowUpRight,
  AlertCircle,
} from 'lucide-react';

import type { WorkspaceTicket } from '@/lib/types';
import type { LinearIssueData, TicketDraftData } from '../types';
import { computeVisualDiff } from '../utils/diff';
import { DiffFieldViewer } from './diff-field-viewer';
import { SYNC_STATUS_LABELS } from '../utils/status';

// Human-readable field names for display in the accordion trigger
const FIELD_LABELS: Record<string, string> = {
  title: 'title',
  description: 'description',
  statusName: 'status',
  priority: 'priority',
  assigneeId: 'assignee',
  labels: 'labels',
};

interface DiffReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pendingTickets: WorkspaceTicket[];
  onPush: (ticketIds: number[]) => Promise<void>;
  pushing: boolean;
}

export function DiffReviewModal({
  open,
  onOpenChange,
  pendingTickets,
  onPush,
  pushing,
}: DiffReviewModalProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [pushError, setPushError] = useState<string | null>(null);

  // Initialize all selected when opened
  if (open && selectedIds.length === 0 && pendingTickets.length > 0) {
    setSelectedIds(pendingTickets.map((t) => t.id));
  }

  const handleToggleSelectId = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handlePush = async () => {
    if (selectedIds.length === 0) return;
    setPushError(null);
    try {
      await onPush(selectedIds);
    } catch (err) {
      setPushError(
        err instanceof Error ? err.message : 'Push failed unexpectedly',
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl max-h-[85vh] flex flex-col p-0 overflow-hidden bg-card/95 backdrop-blur-md'>
        <DialogHeader className='p-6 pb-4 border-b border-border/40 shrink-0'>
          <DialogTitle className='text-xl font-bold flex items-center gap-2'>
            Review Changes
            <Badge variant='secondary' className='font-mono'>
              {pendingTickets.length}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Review AI edits and manual modifications before pushing to Linear.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className='flex-1 px-6'>
          <div className='py-2 space-y-4'>
            <Accordion type='multiple' className='w-full relative'>
              {pendingTickets.map((ticket) => {
                const isNewLocal = ticket.syncStatus === 'new_local';
                const diffs = computeVisualDiff(
                  ticket.originalData as LinearIssueData | null,
                  ticket.draftData as TicketDraftData | null,
                  isNewLocal,
                );
                const title = isNewLocal
                  ? ((ticket.draftData as Record<string, unknown>)
                      ?.title as string) || 'New Ticket'
                  : ((ticket.originalData as Record<string, unknown>)
                      ?.title as string);
                const ident = ticket.linearIdentifier || 'NEW';
                const isSelected = selectedIds.includes(ticket.id);

                // Field names for quick-view in the accordion trigger
                const changedFieldNames = diffs
                  .map((d) => FIELD_LABELS[d.field as string] || d.field)
                  .join(', ');

                return (
                  <div
                    key={ticket.id}
                    className='relative group border border-border/40 rounded-lg bg-background/40 mb-3 px-3'
                  >
                    <div className='absolute left-3 top-4 z-10 w-4 h-4 flex items-center justify-center'>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleToggleSelectId(ticket.id)}
                        className='bg-background/80'
                      />
                    </div>

                    <AccordionItem
                      value={`item-${ticket.id}`}
                      className='border-none pl-6 pr-1'
                    >
                      <AccordionTrigger className='hover:no-underline py-3 px-2'>
                        <div className='flex items-center gap-3 text-left w-full pr-4'>
                          <span className='shrink-0 flex items-center justify-center bg-muted w-6 h-6 rounded-md'>
                            {isNewLocal ? (
                              <Plus className='w-3.5 h-3.5 text-emerald-500' />
                            ) : (
                              <PenSquare className='w-3.5 h-3.5 text-amber-500' />
                            )}
                          </span>
                          <div className='flex-1 min-w-0 space-y-0.5'>
                            <div className='flex items-center gap-2'>
                              <span className='font-mono text-[10px] uppercase font-bold text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded'>
                                {ident}
                              </span>
                              <Badge
                                variant='outline'
                                className='text-[10px] font-medium py-0'
                              >
                                {SYNC_STATUS_LABELS[ticket.syncStatus]}
                              </Badge>
                            </div>
                            <p className='text-sm font-medium leading-snug truncate'>
                              {title}
                            </p>
                            {/* Field names — quick overview */}
                            {changedFieldNames && (
                              <p className='text-[10px] text-muted-foreground font-mono truncate'>
                                {changedFieldNames}
                              </p>
                            )}
                          </div>
                          <span className='text-xs text-muted-foreground shrink-0 tabular-nums'>
                            {diffs.length}{' '}
                            {diffs.length === 1 ? 'field' : 'fields'}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className='pb-4 px-2'>
                        <div className='bg-muted/20 border border-border/30 rounded-lg p-4 space-y-3'>
                          {diffs.length === 0 ? (
                            <span className='text-xs text-muted-foreground italic'>
                              No fields changed.
                            </span>
                          ) : (
                            diffs.map((diff) => (
                              <DiffFieldViewer
                                key={diff.field.toString()}
                                diff={diff}
                              />
                            ))
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </div>
                );
              })}
            </Accordion>
          </div>
        </ScrollArea>

        <DialogFooter className='p-4 border-t border-border/40 gap-3 shrink-0 bg-background/90 shadow-[0_-10px_30px_rgba(0,0,0,0.1)] items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Checkbox
              checked={
                selectedIds.length === pendingTickets.length &&
                pendingTickets.length > 0
              }
              onCheckedChange={(checked) => {
                if (checked) setSelectedIds(pendingTickets.map((t) => t.id));
                else setSelectedIds([]);
              }}
              id='select-all'
            />
            <label
              htmlFor='select-all'
              className='text-sm font-medium leading-none cursor-pointer'
            >
              Select All{' '}
              {pendingTickets.length > 0 &&
                `(${selectedIds.length}/${pendingTickets.length})`}
            </label>
          </div>

          <div className='flex flex-col items-end gap-2'>
            {pushError && (
              <div className='flex items-center gap-1.5 text-xs text-rose-500 font-medium'>
                <AlertCircle className='w-3.5 h-3.5' />
                {pushError}
              </div>
            )}
            <div className='flex items-center gap-2'>
              <Button variant='ghost' onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                className='bg-[--linear] hover:bg-[--linear-hover] text-white opacity-100 transition-all gap-2'
                onClick={handlePush}
                disabled={pushing || selectedIds.length === 0}
              >
                {pushing ? (
                  <Loader2 className='w-4 h-4 animate-spin' />
                ) : (
                  <ArrowUpRight className='w-4 h-4' />
                )}
                Push {selectedIds.length > 0 ? `${selectedIds.length} ` : ''}
                Selected
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
