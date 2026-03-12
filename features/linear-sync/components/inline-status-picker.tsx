'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getStatusColor, getStatusIcon } from '../utils/status';

interface InlineStatusPickerProps {
  statusName: string;
  onUpdate: (status: string) => void;
  disabled?: boolean;
}

const LINEAR_STATUSES = [
  'Backlog',
  'Todo',
  'In Progress',
  'In Review',
  'Done',
  'Canceled',
];

export function InlineStatusPicker({
  statusName,
  onUpdate,
  disabled,
}: InlineStatusPickerProps) {
  const Icon = getStatusIcon(statusName);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={disabled}
        className='flex items-center gap-2 outline-none group bg-transparent hover:bg-muted/50 px-2 py-1 -ml-2 rounded-md transition-colors'
      >
        <span
          className={`shrink-0 w-3 h-3 rounded-full border border-current shadow-sm ${getStatusColor(statusName)}`}
        >
          {Icon && <Icon className='w-full h-full p-px opacity-80' />}
        </span>
        <span className='text-sm capitalize font-medium text-foreground group-hover:text-[--linear] transition-colors'>
          {statusName}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start' className='w-40'>
        {LINEAR_STATUSES.map((status) => (
          <DropdownMenuItem
            key={status}
            onClick={(e) => {
              e.stopPropagation();
              onUpdate(status);
            }}
            className='gap-2 cursor-pointer'
          >
            <span
              className={`shrink-0 w-3 h-3 rounded-full border border-current ${getStatusColor(status)}`}
            />
            <span className='capitalize font-medium'>{status}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
