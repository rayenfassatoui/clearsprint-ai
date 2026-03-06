'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useState, useEffect } from 'react';
import { updateTicket, deleteTicket } from '@/features/tickets/actions/tickets.server';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Sparkles } from 'lucide-react';
import { TicketTweakDialog } from './ticket-tweak-dialog';

interface Ticket {
  id: number;
  title: string | null;
  description: string | null;
  type: 'epic' | 'task' | 'subtask' | null;
  jiraId: string | null;
  parentId: number | null;
  orderIndex: number | null;
  projectId: number | null;
}

interface TicketDetailsSheetProps {
  ticket: Ticket | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

export function TicketDetailsSheet({ ticket, open, onOpenChange, onUpdate }: TicketDetailsSheetProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'epic' | 'task' | 'subtask'>('task');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (ticket) {
      setTitle(ticket.title || '');
      setDescription(ticket.description || '');
      setType(ticket.type || 'task');
    }
  }, [ticket]);

  const handleSave = async () => {
    if (!ticket) return;
    setSaving(true);
    const res = await updateTicket(ticket.id, { title, description, type });
    if (res.success) {
      toast.success('Ticket updated');
      onUpdate();
      onOpenChange(false);
    } else {
      toast.error(res.error);
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!ticket) return;
    if (!confirm('Are you sure? This will delete all children tickets too.')) return;
    const res = await deleteTicket(ticket.id);
    if (res.success) {
      toast.success('Deleted');
      onUpdate();
      onOpenChange(false);
    } else {
      toast.error(res.error);
    }
  };

  if (!ticket) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl overflow-y-auto">
        <SheetHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <Select value={type} onValueChange={(v: any) => setType(v)}>
                <SelectTrigger className="w-[120px]">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="epic">Epic</SelectItem>
                    <SelectItem value="task">Task</SelectItem>
                    <SelectItem value="subtask">Subtask</SelectItem>
                </SelectContent>
            </Select>
            {ticket.jiraId && <Badge variant="outline">{ticket.jiraId}</Badge>}
          </div>
          <SheetTitle>
            <Input 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                className="text-xl font-bold border-none shadow-none px-0 focus-visible:ring-0"
                placeholder="Ticket Title"
            />
          </SheetTitle>
        </SheetHeader>
        
        <div className="py-6 space-y-6">
            <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <Textarea 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    className="min-h-[200px] resize-none"
                    placeholder="Add a description..."
                />
            </div>
        </div>

        <SheetFooter className="flex-col sm:flex-row gap-3 sm:justify-between items-center border-t pt-6">
            <Button variant="destructive" size="sm" onClick={handleDelete} className="w-full sm:w-auto">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
            </Button>
            <div className="flex gap-2 w-full sm:w-auto">
                <TicketTweakDialog 
                    ticketId={ticket.id} 
                    onSuccess={() => {
                        onUpdate();
                        // Maybe reload ticket data here?
                    }}
                    trigger={
                        <Button variant="outline" size="sm" className="w-full sm:w-auto">
                            <Sparkles className="w-4 h-4 mr-2" />
                            AI Refine
                        </Button>
                    }
                />
                <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
                    {saving ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
