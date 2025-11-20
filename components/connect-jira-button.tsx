'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';

export function ConnectJiraButton() {
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    setLoading(true);

    try {
      // Open OAuth flow in a new tab/window
      await authClient.signIn.social(
        {
          provider: 'atlassian',
          callbackURL: '/dashboard',
        },
        {
          // Open in new tab (better-auth will handle this)
          newTab: true,
          onSuccess: () => {
            toast.success('Connected to Jira successfully');
            setLoading(false);
          },
          onError: (ctx) => {
            console.error('Jira OAuth Error:', ctx.error);
            toast.error(ctx.error.message || 'Failed to connect to Jira');
            setLoading(false);
          },
        },
      );
    } catch (error) {
      console.error('Connection error:', error);
      toast.error('Failed to initiate Jira connection');
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleConnect} disabled={loading}>
      {loading ? 'Connecting...' : 'Connect Jira'}
    </Button>
  );
}
