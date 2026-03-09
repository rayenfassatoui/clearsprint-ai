'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutList, KanbanSquare } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface WorkspaceToolbarProps {
  viewMode: 'list' | 'kanban';
  onViewModeChange: (v: 'list' | 'kanban') => void;
  statusFilter: string;
  onStatusFilterChange: (s: string) => void;
}

export function WorkspaceToolbar({
  viewMode,
  onViewModeChange,
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

      <div className='h-6 w-px bg-border/50 mx-1' />

      <Tabs
        value={viewMode}
        onValueChange={(v) => onViewModeChange(v as 'list' | 'kanban')}
        className='h-9'
      >
        <TabsList className='h-full bg-muted/50 border border-border/40 p-1'>
          <TabsTrigger
            value='list'
            className='h-full px-3 gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm'
          >
            <LayoutList className='w-4 h-4' />
            <span className='hidden sm:inline'>List</span>
          </TabsTrigger>
          <TabsTrigger
            value='kanban'
            className='h-full px-3 gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm'
          >
            <KanbanSquare className='w-4 h-4' />
            <span className='hidden sm:inline'>Board</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
