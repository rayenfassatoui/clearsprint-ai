'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft, RefreshCcw } from 'lucide-react';
import Link from 'next/link';

export default function WorkspaceError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('WorkspacePage Error:', error);
  }, [error]);

  return (
    <div className='flex flex-col items-center justify-center min-h-[60vh] p-8 text-center animate-in fade-in duration-500'>
      <div className='h-20 w-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6'>
        <AlertCircle className='h-10 w-10 text-red-500' />
      </div>
      <h2 className='text-3xl font-bold tracking-tight mb-3'>
        Workspace Unavailable
      </h2>
      <p className='text-muted-foreground max-w-md mx-auto mb-8'>
        We encountered an error loading this project. The Linear connection might be timing out, or the project data is corrupted.
      </p>
      
      <div className='flex flex-col sm:flex-row gap-4 justify-center'>
        <Button 
          onClick={() => reset()} 
          size='lg'
          className='min-w-[140px]'
        >
          <RefreshCcw className='mr-2 h-4 w-4' />
          Try Again
        </Button>
        <Button 
          variant='secondary' 
          size='lg' 
          asChild
          className='min-w-[140px]'
        >
          <Link href="/dashboard">
            <ArrowLeft className='mr-2 h-4 w-4' />
            Dashboard
          </Link>
        </Button>
      </div>
      
      {process.env.NODE_ENV === 'development' && (
        <div className='mt-12 p-4 bg-muted/50 rounded-xl text-left max-w-2xl w-full overflow-auto text-xs font-mono text-muted-foreground'>
          <p className='font-bold mb-2 text-foreground'>Developer Details:</p>
          {error.message}
        </div>
      )}
    </div>
  );
}
