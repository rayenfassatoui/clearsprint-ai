'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className='flex flex-col items-center justify-center py-24 text-center px-4'
    >
      <div className='relative mb-6'>
        <div className='absolute inset-0 rounded-full bg-[--linear]/10 blur-xl scale-150' />
        <div className='relative h-16 w-16 rounded-2xl bg-muted flex items-center justify-center border border-border/50'>
          <Icon className='w-7 h-7 text-muted-foreground/60' />
        </div>
      </div>

      <h3 className='text-xl font-semibold mb-2 tracking-tight'>{title}</h3>
      <p className='text-sm text-muted-foreground max-w-sm leading-relaxed mb-6'>
        {description}
      </p>

      {action && (
        <Button
          size='sm'
          variant='outline'
          onClick={action.onClick}
          className='rounded-xl border-border/50 hover:border-[--linear]/50 hover:text-[--linear] transition-colors'
        >
          {action.label}
        </Button>
      )}
    </motion.div>
  );
}
