'use client';

import {
  closestCenter,
  DndContext,
  type DragCancelEvent,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Edit2, GripVertical, Sparkles, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  deleteTicket,
  getProjectTickets,
  updateTicket,
  updateTicketOrder,
} from '@/actions/tickets.server';
import { KanbanBoardSkeleton } from '@/components/skeletons';
import { TicketTweakDialog } from '@/components/ticket-tweak-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface Ticket {
  id: number;
  projectId: number | null;
  type: 'epic' | 'task' | 'subtask' | null;
  title: string | null;
  description: string | null;
  parentId: number | null;
  orderIndex: number | null;
  jiraId: string | null;
}

export function KanbanBoard({ projectId }: { projectId: number }) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  async function loadTickets() {
    setLoading(true);
    const res = await getProjectTickets(projectId);
    if (res.success && res.tickets) {
      setTickets(res.tickets);
    } else {
      toast.error(res.error);
    }
    setLoading(false);
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as number);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      // Find the container (parent) of the items
      // For simplicity, we only allow reordering within the same parent for now in this UI
      // To support reparenting, we'd need a more complex tree structure handling

      const activeTicket = tickets.find((t) => t.id === active.id);
      const overTicket = tickets.find((t) => t.id === over.id);

      if (
        activeTicket &&
        overTicket &&
        activeTicket.parentId === overTicket.parentId
      ) {
        const siblings = tickets
          .filter((t) => t.parentId === activeTicket.parentId)
          .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
        const oldIndex = siblings.findIndex((t) => t.id === active.id);
        const newIndex = siblings.findIndex((t) => t.id === over.id);

        const newSiblings = arrayMove(siblings, oldIndex, newIndex);

        // Update local state
        // We need to map the new order to the global tickets array
        const newTickets = [...tickets];
        newSiblings.forEach((t, index) => {
          const globalIndex = newTickets.findIndex((x) => x.id === t.id);
          if (globalIndex !== -1) {
            newTickets[globalIndex] = {
              ...newTickets[globalIndex],
              orderIndex: index,
            };
          }
        });

        setTickets(newTickets);

        // Save to server
        updateTicketOrder(
          newSiblings.map((t, i) => ({
            id: t.id,
            parentId: t.parentId,
            orderIndex: i,
          }))
        ).then((res) => {
          if (!res.success) toast.error('Failed to save order');
        });
      }
    }
  }

  function handleDragCancel(event: DragCancelEvent) {
    setActiveId(null);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className='space-y-4'>
        {loading ? (
          <div className='p-4'>
            <KanbanBoardSkeleton />
          </div>
        ) : (
          <div className='space-y-4'>
            <TicketList
              tickets={tickets}
              parentId={null}
              level={0}
              onTicketUpdate={loadTickets}
            />
          </div>
        )}
      </div>
      <DragOverlay>
        {activeId ? (
          <div className='opacity-80'>
            <TicketItemOverlay
              ticket={tickets.find((t) => t.id === activeId)!}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function TicketList({
  tickets,
  parentId,
  level,
  onTicketUpdate,
}: {
  tickets: Ticket[];
  parentId: number | null;
  level: number;
  onTicketUpdate: () => void;
}) {
  const items = tickets
    .filter((t) => t.parentId === parentId)
    .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));

  return (
    <SortableContext
      items={items.map((t) => t.id)}
      strategy={verticalListSortingStrategy}
    >
      <div className={cn('space-y-2', level > 0 && 'ml-6 border-l pl-4')}>
        {items.map((ticket) => (
          <SortableTicketItem
            key={ticket.id}
            ticket={ticket}
            allTickets={tickets}
            level={level}
            onUpdate={onTicketUpdate}
          />
        ))}
      </div>
    </SortableContext>
  );
}

function SortableTicketItem({
  ticket,
  allTickets,
  level,
  onUpdate,
}: {
  ticket: Ticket;
  allTickets: Ticket[];
  level: number;
  onUpdate: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: ticket.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className='group'>
      <TicketItemContent
        ticket={ticket}
        isDragging={isDragging}
        dragHandleProps={{ ...attributes, ...listeners }}
        onUpdate={onUpdate}
      />
      {/* Render Children - NOT sortable as part of this list, but as their own list */}
      <TicketList
        tickets={allTickets}
        parentId={ticket.id}
        level={level + 1}
        onTicketUpdate={onUpdate}
      />
    </div>
  );
}

function TicketItemOverlay({ ticket }: { ticket: Ticket }) {
  return <TicketItemContent ticket={ticket} isDragging={true} />;
}

function TicketItemContent({
  ticket,
  isDragging,
  dragHandleProps,
  onUpdate,
}: {
  ticket: Ticket;
  isDragging: boolean;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
  onUpdate?: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(ticket.title || '');
  const [description, setDescription] = useState(ticket.description || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!onUpdate) return;
    setSaving(true);
    const res = await updateTicket(ticket.id, { title, description });
    if (res.success) {
      toast.success('Saved');
      setIsEditing(false);
      onUpdate();
    } else {
      toast.error(res.error);
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!onUpdate) return;
    if (!confirm('Are you sure? This will delete all children tickets too.'))
      return;
    const res = await deleteTicket(ticket.id);
    if (res.success) {
      toast.success('Deleted');
      onUpdate();
    } else {
      toast.error(res.error);
    }
  };

  const typeColors = {
    epic: 'bg-purple-100 text-purple-800 border-purple-200',
    task: 'bg-blue-100 text-blue-800 border-blue-200',
    subtask: 'bg-green-100 text-green-800 border-green-200',
  };

  return (
    <div
      className={cn(
        'flex items-start p-3 rounded-lg border bg-white shadow-sm hover:shadow-md transition-all',
        isDragging && 'shadow-xl ring-2 ring-primary rotate-1',
        isEditing && 'ring-2 ring-primary'
      )}
    >
      <div
        {...dragHandleProps}
        className='cursor-grab p-1 mr-2 text-gray-400 hover:text-gray-600 mt-0.5'
      >
        <GripVertical className='h-4 w-4' />
      </div>

      <div
        className={cn(
          'px-2 py-0.5 rounded text-[10px] font-bold uppercase mr-3 mt-1',
          typeColors[ticket.type || 'task']
        )}
      >
        {ticket.type}
      </div>

      <div className='flex-1 min-w-0 space-y-1'>
        {isEditing ? (
          <div className='space-y-2'>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className='h-8 font-medium'
            />
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className='text-xs min-h-[60px]'
            />
            <div className='flex space-x-2'>
              <Button size='sm' onClick={handleSave} disabled={saving}>
                Save
              </Button>
              <Button
                size='sm'
                variant='ghost'
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <h4 className='text-sm font-medium leading-tight'>
              {ticket.title}
            </h4>
            {ticket.description && (
              <p className='text-xs text-muted-foreground line-clamp-2'>
                {ticket.description}
              </p>
            )}
          </>
        )}
      </div>

      {!isEditing && onUpdate && (
        <div className='flex items-center opacity-0 group-hover:opacity-100 transition-opacity ml-2'>
          <TicketTweakDialog
            ticketId={ticket.id}
            onSuccess={onUpdate}
            trigger={
              <Button
                variant='ghost'
                size='icon'
                className='h-6 w-6 text-purple-500 hover:text-purple-600 hover:bg-purple-50'
              >
                <Sparkles className='h-3 w-3' />
              </Button>
            }
          />
          <Button
            variant='ghost'
            size='icon'
            className='h-6 w-6'
            onClick={() => setIsEditing(true)}
          >
            <Edit2 className='h-3 w-3' />
          </Button>
          <Button
            variant='ghost'
            size='icon'
            className='h-6 w-6 text-red-500 hover:text-red-600'
            onClick={handleDelete}
          >
            <Trash2 className='h-3 w-3' />
          </Button>
        </div>
      )}
    </div>
  );
}
