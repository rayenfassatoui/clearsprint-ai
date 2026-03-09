'use client';

import { useState, useEffect, useId } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Loader2,
  Save,
  X,
  AlertTriangle,
  Users,
  GitBranch,
  Calendar,
  Layers,
  Gauge,
} from 'lucide-react';

import type { WorkspaceTicket } from '@/lib/types';
import type { TicketDraftData, LinearIssueData } from '../types';
import { updateTicketDraft } from '../actions/tickets.server';
import { useAiEdit } from '../hooks/use-ai-edit';
import { AiPromptBar } from './ai-prompt-bar';
import { getPriorityMeta } from '../utils/status';

interface TicketDetailSheetProps {
  ticket: WorkspaceTicket | null;
  onClose: () => void;
  onUpdate: (ticket: WorkspaceTicket) => void;
}

const PRIORITY_OPTIONS = [
  { value: 0, label: 'No Priority' },
  { value: 1, label: 'Urgent' },
  { value: 2, label: 'High' },
  { value: 3, label: 'Medium' },
  { value: 4, label: 'Low' },
] as const;

function SectionLabel({
  htmlFor,
  icon: Icon,
  children,
}: {
  htmlFor: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className='flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer'
    >
      {Icon && <Icon className='w-3.5 h-3.5' />}
      {children}
    </label>
  );
}

export function TicketDetailSheet({
  ticket,
  onClose,
  onUpdate,
}: TicketDetailSheetProps) {
  const uid = useId();
  const id = (name: string) => `${uid}-${name}`;

  const [saving, setSaving] = useState(false);
  const [editingData, setEditingData] = useState<TicketDraftData>({});
  const {
    editSingleTicket,
    createSubtasks,
    loading: aiLoading,
    error: aiError,
  } = useAiEdit();

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset when ticket changes
  useEffect(() => {
    setEditingData({});
  }, [ticket?.id]);

  if (!ticket) return null;

  const isRemoteDeleted = ticket.syncStatus === 'remote_deleted';
  const original = ticket.originalData as LinearIssueData | null;
  const draft = ticket.draftData as TicketDraftData | null;

  // Merge: editing > draft > original (type-safe)
  function get<K extends keyof LinearIssueData>(
    field: K,
  ): LinearIssueData[K] | undefined {
    return (
      (editingData as Partial<LinearIssueData>)[field] ??
      (draft as Partial<LinearIssueData> | null)?.[field] ??
      original?.[field]
    );
  }

  const currentTitle = get('title') ?? '';
  const currentDescription = get('description') ?? '';
  const currentStatusName = get('statusName') ?? 'Backlog';
  const currentStatusId = get('statusId') ?? '';
  const currentPriority = get('priority') ?? 0;
  const currentAssigneeName = get('assigneeName') ?? null;
  const currentAssigneeId = get('assigneeId') ?? null;
  const currentLabels = get('labels') ?? [];
  const currentLabelIds = get('labelIds') ?? [];
  const currentEstimate = get('estimate') ?? null;
  const currentDueDate = get('dueDate') ?? null;
  const currentParentIdentifier = get('parentIdentifier') ?? null;
  const currentParentId = get('parentId') ?? null;
  const childIdentifiers = original?.childIdentifiers ?? [];
  const subscriberIds = original?.subscriberIds ?? [];

  const hasUnsavedChanges = Object.keys(editingData).length > 0;
  const priorityMeta = getPriorityMeta(currentPriority);

  const patch = (updates: Partial<TicketDraftData>) =>
    setEditingData((prev) => ({ ...prev, ...updates }));

  const handleSave = async () => {
    if (!hasUnsavedChanges) return;
    setSaving(true);
    try {
      const res = await updateTicketDraft(ticket.id, editingData);
      if (res.success && res.data) {
        toast.success('Draft saved');
        onUpdate(res.data);
        setEditingData({});
        onClose();
      } else {
        toast.error(res.error || 'Failed to save draft');
      }
    } catch (err) {
      console.error(err);
      toast.error('An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleAiApply = async (prompt: string, type: 'edit' | 'subtasks') => {
    if (type === 'edit') {
      // Build a merged snapshot to give AI full context
      const merged: LinearIssueData = {
        ...(original ?? ({} as LinearIssueData)),
        ...Object.fromEntries(
          Object.entries({ ...(draft ?? {}), ...editingData }).filter(
            ([, v]) => v !== undefined,
          ),
        ),
      } as LinearIssueData;
      const res = await editSingleTicket(merged, prompt);
      if (res) {
        patch(res);
        toast.success('AI edit applied — review changes and save');
      } else if (!aiError) {
        toast.warning('AI made no changes to this ticket');
      }
    } else {
      const res = await createSubtasks(ticket.id, prompt);
      if (res && res.length > 0) {
        toast.success(
          `Created ${res.length} subtask${res.length !== 1 ? 's' : ''}`,
        );
      }
    }
  };

  return (
    <Sheet open={!!ticket} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className='w-[440px] sm:w-[560px] overflow-hidden flex flex-col bg-card border-l border-border/40 sm:max-w-xl p-0'>
        {/* Header */}
        <SheetHeader className='px-6 pt-6 pb-4 border-b border-border/40 shrink-0'>
          <div className='flex items-start justify-between'>
            <SheetTitle className='flex items-center gap-2 text-base font-semibold'>
              <span className='bg-[--linear]/10 text-[--linear] px-2 py-1 rounded text-sm font-mono font-bold'>
                {ticket.linearIdentifier || 'NEW'}
              </span>
              Edit Ticket
            </SheetTitle>
            <Button
              variant='ghost'
              size='icon'
              className='h-7 w-7 text-muted-foreground hover:text-foreground shrink-0'
              onClick={onClose}
            >
              <X className='h-4 w-4' />
            </Button>
          </div>
        </SheetHeader>

        {/* Remote deleted warning */}
        {isRemoteDeleted && (
          <div className='mx-6 mt-4 flex items-center gap-2.5 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-600'>
            <AlertTriangle className='w-4 h-4 shrink-0' />
            This ticket was deleted on Linear. Editing is disabled.
          </div>
        )}

        {/* Scrollable body */}
        <div
          className={`flex-1 overflow-y-auto px-6 py-4 space-y-5 pb-48 ${
            isRemoteDeleted ? 'pointer-events-none opacity-60' : ''
          }`}
        >
          {/* Title */}
          <div className='space-y-1.5'>
            <SectionLabel htmlFor={id('title')}>Title</SectionLabel>
            <Input
              id={id('title')}
              value={currentTitle}
              onChange={(e) => patch({ title: e.target.value })}
              className='font-medium bg-muted/30 border-border/40'
            />
          </div>

          {/* Description */}
          <div className='space-y-1.5'>
            <SectionLabel htmlFor={id('desc')}>Description</SectionLabel>
            <Textarea
              id={id('desc')}
              value={currentDescription ?? ''}
              onChange={(e) => patch({ description: e.target.value })}
              className='min-h-[120px] font-mono text-sm bg-muted/30 border-border/40 resize-y'
            />
          </div>

          {/* Status + Priority */}
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-1.5'>
              <SectionLabel htmlFor={id('status')}>Status</SectionLabel>
              <Input
                id={id('status')}
                value={currentStatusName}
                onChange={(e) =>
                  patch({
                    statusName: e.target.value,
                    statusId: currentStatusId,
                  })
                }
                className='bg-muted/30 border-border/40 text-sm'
                placeholder='e.g. In Progress'
              />
              {original?.statusName &&
                original.statusName !== currentStatusName && (
                  <p className='text-[10px] text-muted-foreground line-through'>
                    {original.statusName}
                  </p>
                )}
            </div>

            <div className='space-y-1.5'>
              <SectionLabel htmlFor={id('priority')}>Priority</SectionLabel>
              <select
                id={id('priority')}
                value={currentPriority}
                onChange={(e) =>
                  patch({ priority: parseInt(e.target.value, 10) })
                }
                className='w-full h-9 rounded-md border border-border/40 bg-muted/30 px-3 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-[--linear]/30'
              >
                {PRIORITY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <p className={`text-[10px] font-semibold ${priorityMeta.color}`}>
                {priorityMeta.label}
              </p>
            </div>
          </div>

          {/* Assignee */}
          <div className='space-y-1.5'>
            <SectionLabel htmlFor={id('assignee')} icon={Users}>
              Assignee
            </SectionLabel>
            <Input
              id={id('assignee')}
              value={currentAssigneeName ?? ''}
              onChange={(e) =>
                patch({
                  assigneeName: e.target.value || null,
                  assigneeId: currentAssigneeId,
                })
              }
              className='bg-muted/30 border-border/40 text-sm'
              placeholder='Assignee name'
            />
            {currentAssigneeId && (
              <p className='text-[10px] text-muted-foreground font-mono truncate'>
                ID: {currentAssigneeId}
              </p>
            )}
          </div>

          {/* Estimate + Due Date */}
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-1.5'>
              <SectionLabel htmlFor={id('estimate')} icon={Gauge}>
                Estimate
              </SectionLabel>
              <Input
                id={id('estimate')}
                type='number'
                min='0'
                step='0.5'
                value={currentEstimate ?? ''}
                onChange={(e) =>
                  patch({
                    estimate:
                      e.target.value === '' ? null : parseFloat(e.target.value),
                  })
                }
                className='bg-muted/30 border-border/40 text-sm'
                placeholder='Story points'
              />
            </div>

            <div className='space-y-1.5'>
              <SectionLabel htmlFor={id('dueDate')} icon={Calendar}>
                Due Date
              </SectionLabel>
              <Input
                id={id('dueDate')}
                type='date'
                value={currentDueDate ?? ''}
                onChange={(e) => patch({ dueDate: e.target.value || null })}
                className='bg-muted/30 border-border/40 text-sm'
              />
            </div>
          </div>

          {/* Labels */}
          <div className='space-y-1.5'>
            <p className='flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
              Labels
            </p>
            {currentLabels.length > 0 ? (
              <div className='flex flex-wrap gap-1.5'>
                {currentLabels.map((label, i) => (
                  <Badge
                    key={label}
                    variant='outline'
                    className='text-xs gap-1 cursor-pointer hover:bg-red-500/10 hover:text-red-600 hover:border-red-500/20 transition-colors'
                    onClick={() => {
                      patch({
                        labels: currentLabels.filter((_, idx) => idx !== i),
                        labelIds: currentLabelIds.filter((_, idx) => idx !== i),
                      });
                    }}
                  >
                    {label} <X className='w-3 h-3' />
                  </Badge>
                ))}
              </div>
            ) : (
              <p className='text-xs text-muted-foreground italic'>
                No labels — AI can suggest them
              </p>
            )}
          </div>

          {/* Parent Issue */}
          <div className='space-y-1.5'>
            <SectionLabel htmlFor={id('parent')} icon={GitBranch}>
              Parent Issue
            </SectionLabel>
            <Input
              id={id('parent')}
              value={currentParentIdentifier ?? ''}
              onChange={(e) =>
                patch({
                  parentIdentifier: e.target.value || null,
                  parentId: currentParentId,
                })
              }
              className='bg-muted/30 border-border/40 text-sm font-mono'
              placeholder='e.g. PROJ-1'
            />
          </div>

          {/* Children (read-only) */}
          {childIdentifiers.length > 0 && (
            <div className='space-y-1.5'>
              <p className='flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                <Layers className='w-3.5 h-3.5' /> Sub-issues (
                {childIdentifiers.length})
              </p>
              <div className='flex flex-wrap gap-1.5'>
                {childIdentifiers.map((cid) => (
                  <Badge
                    key={cid}
                    variant='secondary'
                    className='font-mono text-xs'
                  >
                    {cid}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Subscribers (read-only) */}
          {subscriberIds.length > 0 && (
            <div className='space-y-1.5'>
              <p className='flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                <Users className='w-3.5 h-3.5' /> Followers
              </p>
              <p className='text-xs text-muted-foreground'>
                {subscriberIds.length} subscriber
                {subscriberIds.length !== 1 ? 's' : ''} watching this issue
              </p>
            </div>
          )}
        </div>

        {/* Sticky bottom — AI + Save */}
        {!isRemoteDeleted && (
          <div className='absolute bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border/40 flex flex-col gap-2 p-4 shrink-0'>
            <AiPromptBar
              onApply={handleAiApply}
              loading={aiLoading}
              error={aiError}
            />
            <Button
              onClick={handleSave}
              disabled={saving || !hasUnsavedChanges}
              className='w-full bg-[--linear] hover:bg-[--linear-hover] text-white'
            >
              {saving ? (
                <Loader2 className='w-4 h-4 mr-2 animate-spin' />
              ) : (
                <Save className='w-4 h-4 mr-2' />
              )}
              Save &amp; Close
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
