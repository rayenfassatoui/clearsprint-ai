'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface WorkspaceToolbarProps {
  statusFilter: string;
  onStatusFilterChange: (s: string) => void;
}

export function WorkspaceToolbar({
  statusFilter,
  onStatusFilterChange,
}: WorkspaceToolbarProps) {
  return (
    <div className='flex items-center gap-3'>
      <Select value={statusFilter} onValueChange={onStatusFilterChange}>
        <SelectTrigger className='w-[140px] h-9 text-sm'>
          <SelectValue placeholder='Status' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>All Statuses</SelectItem>
          <SelectItem value='backlog'>Backlog</SelectItem>
          <SelectItem value='todo'>Todo</SelectItem>
          <SelectItem value='in_progress'>In Progress</SelectItem>
          <SelectItem value='done'>Done</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
