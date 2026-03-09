'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface CreateProjectDialogProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CreateProjectDialog({
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: CreateProjectDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? controlledOnOpenChange : setInternalOpen;

  const handleOpenChange = (newOpen: boolean) => {
    setOpen?.(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button>
            <Plus className='mr-2 h-4 w-4' />
            New Project
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className='sm:max-w-[400px] p-6 shadow-2xl bg-card'>
        <DialogHeader className='pb-2'>
          <DialogTitle className='flex items-center gap-3 text-2xl'>
            Coming Soon
          </DialogTitle>
        </DialogHeader>
        <div className='pt-2 text-muted-foreground'>
          Linear Sync will be available shortly to import your projects!
        </div>
      </DialogContent>
    </Dialog>
  );
}
