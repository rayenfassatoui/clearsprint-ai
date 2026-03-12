'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Triangle } from 'lucide-react';

interface InlineEstimatePickerProps {
  estimate: number | null;
  onUpdate: (estimate: number | null) => void;
  disabled?: boolean;
}

const FIBONACCI_ESTIMATES = [0, 1, 2, 3, 5, 8, null];

export function InlineEstimatePicker({
  estimate,
  onUpdate,
  disabled,
}: InlineEstimatePickerProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={disabled}
        className='flex items-center gap-1.5 outline-none group bg-transparent hover:bg-muted/50 px-2 py-1 -ml-2 rounded-md transition-colors'
      >
        <Triangle className='w-3 h-3 text-muted-foreground group-hover:text-foreground transition-colors' />
        <span className='text-sm text-muted-foreground font-mono group-hover:text-foreground transition-colors'>
          {estimate ?? '-'}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start' className='w-24'>
        {FIBONACCI_ESTIMATES.map((p) => (
          <DropdownMenuItem
            key={p === null ? 'none' : p.toString()}
            onClick={(e) => {
              e.stopPropagation();
              onUpdate(p);
            }}
            className='cursor-pointer justify-center font-mono'
          >
            {p === null ? 'None' : p}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
