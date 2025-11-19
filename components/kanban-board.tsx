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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

export function KanbanBoard({
  projectId,
  initialTickets = [],
}: {
  projectId: number;
  initialTickets?: Ticket[];
}) {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [loading, setLoading] = useState(initialTickets.length === 0);
  const [activeId, setActiveId] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    if (initialTickets.length === 0) {
      loadTickets();
    } else {
      setTickets(initialTickets);
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, initialTickets]);

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
          })),
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
      <div className="space-y-4">
        {loading ? (
          <div className="p-4">
            <KanbanBoardSkeleton />
          </div>
        ) : (
          <div className="space-y-4">
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
          <div className="opacity-80">
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
    <div ref={setNodeRef} style={style} className="group">
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

  const handleTypeChange = async (newType: 'epic' | 'task' | 'subtask') => {
    if (!onUpdate || ticket.type === newType) return;
    const res = await updateTicket(ticket.id, { type: newType });
    if (res.success) {
      toast.success('Type updated');
      onUpdate();
    } else {
      toast.error(res.error);
    }
  };

  const typeColors = {
    epic: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800',
    task: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
    subtask: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
  };

  return (
    <div
      className={cn(
        'group relative flex items-start p-4 rounded-xl border bg-card text-card-foreground transition-all duration-200',
        'hover:shadow-md hover:border-primary/20',
        isDragging ? 'shadow-2xl ring-2 ring-primary rotate-1 scale-105 z-50' : 'shadow-sm',
        isEditing && 'ring-2 ring-primary shadow-lg',
      )}
    >
      <div
        {...dragHandleProps}
        className="cursor-grab p-1.5 mr-3 text-muted-foreground/40 hover:text-foreground transition-colors mt-0.5 rounded-md hover:bg-muted"
      >
        <GripVertical className="h-5 w-5" />
      </div>

      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center mb-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div
                className={cn(
                  'px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border shadow-sm cursor-pointer hover:opacity-80 transition-opacity',
                  typeColors[ticket.type || 'task'],
                )}
              >
                {ticket.type}
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => handleTypeChange('epic')}>
                Epic
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleTypeChange('task')}>
                Task
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleTypeChange('subtask')}>
                Subtask
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {ticket.jiraId && (
            <span className="ml-2 text-[10px] text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">
              {ticket.jiraId}
            </span>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="font-semibold text-base h-10"
              placeholder="Ticket Title"
              autoFocus
            />
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-sm min-h-[80px] resize-none"
              placeholder="Description..."
            />
            <div className="flex space-x-2 justify-end pt-2">
              <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-1.5">
            <h4 className="text-base font-semibold leading-snug tracking-tight text-foreground/90">
              {ticket.title}
            </h4>
            {ticket.description && (
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                {ticket.description}
              </p>
            )}
          </div>
        )}
      </div>

      {!isEditing && onUpdate && (
        <div className="absolute top-3 right-3 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
          <TicketTweakDialog
            ticketId={ticket.id}
            onSuccess={onUpdate}
            trigger={
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-purple-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"
              >
                <Sparkles className="h-4 w-4" />
              </Button>
            }
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => setIsEditing(true)}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
