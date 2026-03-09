'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Unplug, CheckCircle2 } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { disconnectLinearAccount } from '../actions/connect.server';
import { toast } from 'sonner';

interface ConnectLinearButtonProps {
  connected: boolean;
  onStatusChange?: () => void;
  className?: string;
}

export function ConnectLinearButton({
  connected,
  onStatusChange,
  className,
}: ConnectLinearButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    try {
      setLoading(true);
      await authClient.signIn.social({
        provider: 'linear',
        callbackURL: '/dashboard', // Redirect back to dashboard after connecting
      });
    } catch (error) {
      console.error('Failed to connect Linear:', error);
      toast.error('Failed to connect to Linear');
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setLoading(true);
      const res = await disconnectLinearAccount();
      if (res.success) {
        toast.success('Linear disconnected');
        onStatusChange?.();
      } else {
        toast.error(res.error || 'Failed to disconnect');
      }
    } catch (error) {
      console.error('Failed to disconnect:', error);
      toast.error('Failed to disconnect');
    } finally {
      setLoading(false);
    }
  };

  if (connected) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className='flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-md border border-emerald-500/20 text-sm font-medium'>
          <CheckCircle2 className='w-4 h-4' />
          <span>Linear Connected</span>
        </div>
        <Button
          variant='outline'
          size='sm'
          onClick={handleDisconnect}
          disabled={loading}
          className='text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors'
        >
          {loading ? (
            <RefreshCw className='w-4 h-4 mr-2 animate-spin' />
          ) : (
            <Unplug className='w-4 h-4 mr-2' />
          )}
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant='default'
      onClick={handleConnect}
      disabled={loading}
      className={`bg-[#5E6AD2] hover:bg-[#4E5BCE] text-white ${className}`}
    >
      {loading ? (
        <RefreshCw className='w-4 h-4 mr-2 animate-spin' />
      ) : (
        <svg
          className='w-4 h-4 mr-2 fill-current'
          viewBox='0 0 24 24'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path d='M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 3c4.97 0 9 4.03 9 9s-4.03 9-9 9-9-4.03-9-9 4.03-9 9-9zm-1.5 4v10l6-5-6-5z' />
        </svg>
      )}
      Connect Linear
    </Button>
  );
}
