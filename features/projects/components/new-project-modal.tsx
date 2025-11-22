'use client';

import { CreateProjectDialog } from '@/features/projects/components/create-project-dialog';

interface NewProjectModalProps {
  jiraConnected?: boolean;
}

export function NewProjectModal({
  jiraConnected = false,
}: NewProjectModalProps) {
  return <CreateProjectDialog jiraConnected={jiraConnected} />;
}
