'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getPriorityIcon, getPriorityLabel } from '../utils/status';

interface InlinePriorityPickerProps {
  priority: number;
  onUpdate: (priority: number) => void;
  disabled?: boolean;
}

export function InlinePriorityPicker({
  priority,
  onUpdate,
  disabled,
}: InlinePriorityPickerProps) {
  const Icon = getPriorityIcon(priority);
  const label = getPriorityLabel(priority);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={disabled}
        className='flex items-center gap-1.5 outline-none group bg-transparent hover:bg-muted/50 px-2 py-1 -ml-2 rounded-md transition-colors'
      >
        <Icon className='w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors' />
        <span className='text-sm text-muted-foreground group-hover:text-foreground transition-colors'>
          {label}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start' className='w-36'>
        {[0, 1, 2, 3, 4].map((p) => {
          const PIcon = getPriorityIcon(p);
          const pLabel = getPriorityLabel(p);
          return (
            <DropdownMenuItem
              key={p}
              onClick={(e) => {
                e.stopPropagation();
                onUpdate(p);
              }}
              className='gap-2 cursor-pointer'
            >
              <PIcon className='w-4 h-4 text-muted-foreground' />
              <span className='font-medium'>{pLabel}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
