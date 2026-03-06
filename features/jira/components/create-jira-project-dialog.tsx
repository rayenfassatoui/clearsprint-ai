'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { CreateJiraProjectForm } from './create-jira-project-form';

interface CreateJiraProjectDialogProps {
  sites: { id: string; name: string; url: string }[];
}

export function CreateJiraProjectDialog({ sites }: CreateJiraProjectDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Plus className="h-4 w-4" />
          Create Jira Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Jira Project</DialogTitle>
          <DialogDescription>
            Create a new project in Jira and sync it to ClearSprint.
          </DialogDescription>
        </DialogHeader>
        <CreateJiraProjectForm sites={sites} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
