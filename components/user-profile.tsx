'use client';

import { CheckCircle2, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { checkJiraConnectionStatus } from '@/actions/user.server';

interface UserProfileProps {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
}

export function UserProfile({ user }: UserProfileProps) {
  const [jiraConnected, setJiraConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const result = await checkJiraConnectionStatus();
      setJiraConnected(result.connected);
    } catch (error) {
      setJiraConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = () => {
    if (user.name) {
      return user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user.email[0].toUpperCase();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className='w-full outline-none'>
        <div className='flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer group'>
          <Avatar className='h-9 w-9 border-2 border-border group-hover:border-primary transition-colors'>
            <AvatarImage src={user.image || undefined} alt={user.name} />
            <AvatarFallback className='bg-primary/10 text-primary font-medium text-sm'>
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <div className='flex-1 text-left min-w-0'>
            <p className='text-sm font-medium truncate'>{user.name}</p>
            <p className='text-xs text-muted-foreground truncate'>
              {user.email}
            </p>
          </div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-64'>
        <DropdownMenuLabel className='font-normal'>
          <div className='flex flex-col space-y-1'>
            <p className='text-sm font-medium leading-none'>{user.name}</p>
            <p className='text-xs leading-none text-muted-foreground'>
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled className='flex items-center gap-2'>
          {loading ? (
            <>
              <div className='h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent' />
              <span>Checking Jira...</span>
            </>
          ) : jiraConnected ? (
            <>
              <CheckCircle2 className='h-4 w-4 text-green-500' />
              <span>Jira Connected</span>
            </>
          ) : (
            <>
              <XCircle className='h-4 w-4 text-muted-foreground' />
              <span>Jira Not Connected</span>
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
