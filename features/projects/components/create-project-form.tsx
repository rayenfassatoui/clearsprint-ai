'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Dropzone } from '@/components/dropzone';

interface CreateProjectFormProps {
  onSuccess?: () => void;
}

export function CreateProjectForm({ onSuccess }: CreateProjectFormProps) {
  const router = useRouter();

  const handleUploadComplete = (result: {
    url: string;
    text: string;
    projectId?: number;
  }) => {
    if (result.projectId) {
      toast.success('Project created! Redirecting...');
      if (onSuccess) onSuccess();
      router.refresh();
      router.push(`/dashboard/projects/${result.projectId}`);
    } else {
      // Fallback if projectId is missing for some reason
      toast.success('Document uploaded.');
      router.refresh();
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground mb-4">
        Upload a PDF or text file (PRD) to generate a backlog automatically.
      </div>
      <Dropzone onUploadComplete={handleUploadComplete} />
    </div>
  );
}
