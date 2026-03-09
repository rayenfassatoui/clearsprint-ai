'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function WorkspaceSkeleton() {
  return (
    <div className='space-y-6 max-w-[1200px] mx-auto pb-24 p-6'>
      {/* Header Skeleton */}
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 py-6 border-b border-border/40'>
        <div className='space-y-2'>
          <Skeleton className='h-8 w-64' />
          <Skeleton className='h-4 w-48' />
        </div>
        <div className='flex gap-3'>
          <Skeleton className='h-10 w-32' />
          <Skeleton className='h-10 w-40' />
        </div>
      </div>

      {/* Toolbar Skeleton */}
      <div className='flex items-center justify-between gap-4 py-2 border-b border-border/40 pb-4'>
        <Skeleton className='h-10 w-64' />
        <div className='flex gap-2'>
          <Skeleton className='h-10 w-48' />
        </div>
      </div>

      {/* Content Skeleton */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 pt-4'>
        {/* Column 1 */}
        <div className='space-y-4'>
          <Skeleton className='h-6 w-24 mb-4' />
          <Skeleton className='h-32 w-full rounded-xl' />
          <Skeleton className='h-32 w-full rounded-xl opacity-80' />
          <Skeleton className='h-32 w-full rounded-xl opacity-60' />
        </div>
        {/* Column 2 */}
        <div className='space-y-4'>
          <Skeleton className='h-6 w-24 mb-4' />
          <Skeleton className='h-32 w-full rounded-xl opacity-90' />
          <Skeleton className='h-32 w-full rounded-xl opacity-70' />
        </div>
        {/* Column 3 */}
        <div className='space-y-4'>
          <Skeleton className='h-6 w-24 mb-4' />
          <Skeleton className='h-32 w-full rounded-xl opacity-50' />
        </div>
      </div>
    </div>
  );
}
