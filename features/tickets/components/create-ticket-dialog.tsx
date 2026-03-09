'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { createTicket } from '@/features/tickets/actions/tickets.server';

interface CreateTicketDialogProps {
  projectId: number;
  onSuccess: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export function CreateTicketDialog({
  projectId,
  onSuccess,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  trigger,
}: CreateTicketDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'epic' | 'task' | 'subtask'>('task');

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;
  const setIsOpen = isControlled ? setControlledOpen : setInternalOpen;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      const res = await createTicket({
        projectId,
        title,
        description,
        type,
        parentId: null, // Top level for now
      });

      if (res.success) {
        toast.success('Ticket created');
        setTitle('');
        setDescription('');
        setType('task');
        if (setIsOpen) setIsOpen(false);
        onSuccess();
      } else {
        toast.error(res.error);
      }
    } catch (_error) {
      toast.error('Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Create Ticket</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='space-y-4 mt-4'>
          <div className='space-y-2'>
            <Label htmlFor='title'>Title</Label>
            <Input
              id='title'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder='Ticket title'
              autoFocus
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='type'>Type</Label>
            <Select value={type} onValueChange={(v: any) => setType(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='epic'>Epic</SelectItem>
                <SelectItem value='task'>Task</SelectItem>
                <SelectItem value='subtask'>Subtask</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className='space-y-2'>
            <Label htmlFor='description'>Description</Label>
            <Textarea
              id='description'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder='Description...'
              className='min-h-[100px]'
            />
          </div>
          <DialogFooter>
            <Button type='submit' disabled={loading}>
              {loading ? 'Creating...' : 'Create Ticket'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
