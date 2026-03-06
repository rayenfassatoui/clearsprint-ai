'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { createJiraProject } from '@/features/jira/actions/create-jira-project.server';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  key: z.string().min(2, 'Key must be at least 2 characters').toUpperCase(),
  cloudId: z.string().min(1, 'Site is required'),
  template: z.enum(['scrum', 'kanban']),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateJiraProjectFormProps {
  sites: { id: string; name: string; url: string }[];
  onSuccess?: () => void;
}

export function CreateJiraProjectForm({ sites, onSuccess }: CreateJiraProjectFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      key: '',
      cloudId: sites.length > 0 ? sites[0].id : '',
      template: 'scrum',
    },
  });

  // Auto-generate key from name
  const name = form.watch('name');
  useEffect(() => {
    if (name && !form.formState.dirtyFields.key) {
      const generatedKey = name
        .replace(/[^a-zA-Z0-9]/g, '')
        .toUpperCase()
        .substring(0, 10);
      form.setValue('key', generatedKey);
    }
  }, [name, form]);

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('key', data.key);
      formData.append('cloudId', data.cloudId);
      formData.append('template', data.template);

      const result = await createJiraProject(formData);

      if (result.success) {
        toast.success('Jira project created successfully!');
        if (result.warning) {
          toast.warning(result.warning);
        }
        router.refresh();
        if (result.projectId) {
           router.push(`/dashboard/projects/${result.projectId}`);
        }
        onSuccess?.();
      } else {
        toast.error(result.error || 'Failed to create project');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="cloudId">Jira Site</Label>
        <Select
          value={form.watch('cloudId')}
          onValueChange={(val) => form.setValue('cloudId', val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a site" />
          </SelectTrigger>
          <SelectContent>
            {sites.map((site) => (
              <SelectItem key={site.id} value={site.id}>
                {site.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {form.formState.errors.cloudId && (
          <p className="text-sm text-destructive">{form.formState.errors.cloudId.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Project Name</Label>
        <Input id="name" {...form.register('name')} placeholder="e.g. Mobile App Redesign" />
        {form.formState.errors.name && (
          <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="key">Project Key</Label>
        <Input id="key" {...form.register('key')} placeholder="e.g. MOB" maxLength={10} />
        <p className="text-xs text-muted-foreground">
          Unique key to identify the project (max 10 chars).
        </p>
        {form.formState.errors.key && (
          <p className="text-sm text-destructive">{form.formState.errors.key.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="template">Template</Label>
        <Select
          value={form.watch('template')}
          onValueChange={(val: 'scrum' | 'kanban') => form.setValue('template', val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a template" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="scrum">Scrum</SelectItem>
            <SelectItem value="kanban">Kanban</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating...
          </>
        ) : (
          'Create Project'
        )}
      </Button>
    </form>
  );
}
