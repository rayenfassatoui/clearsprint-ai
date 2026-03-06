import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ProjectSyncStatus } from '@/types/jira';
import { CheckCircle2, Cloud, RefreshCw, AlertCircle } from 'lucide-react';

interface ProjectSyncStatusBadgeProps {
  status: ProjectSyncStatus;
  className?: string;
}

export function ProjectSyncStatusBadge({ status, className }: ProjectSyncStatusBadgeProps) {
  const variants = {
    synced: {
      variant: 'default' as const,
      icon: CheckCircle2,
      label: 'Synced',
      className: 'bg-green-500/15 text-green-600 hover:bg-green-500/25 border-green-200 shadow-none',
    },
    available: {
      variant: 'outline' as const,
      icon: Cloud,
      label: 'Available',
      className: 'text-muted-foreground border-dashed',
    },
    syncing: {
      variant: 'secondary' as const,
      icon: RefreshCw,
      label: 'Syncing...',
      className: 'animate-pulse',
    },
    error: {
      variant: 'destructive' as const,
      icon: AlertCircle,
      label: 'Error',
      className: '',
    },
  };

  const config = variants[status] || variants.available;
  const Icon = config.icon;

  return (
    <Badge 
      variant={config.variant} 
      className={cn('gap-1.5', config.className, className)}
    >
      <Icon className={cn("h-3.5 w-3.5", status === 'syncing' && "animate-spin")} />
      {config.label}
    </Badge>
  );
}

