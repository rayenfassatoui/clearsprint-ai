'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';

export function ConnectJiraButton() {
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    setLoading(true);
    await authClient.signIn.social(
      {
        provider: 'atlassian',
        callbackURL: '/dashboard',
      },
      {
        onSuccess: () => {
          toast.success('Connected to Jira successfully');
          setLoading(false);
        },
        onError: (ctx) => {
          toast.error(ctx.error.message);
          setLoading(false);
        },
      },
    );
  };

  return (
    <Button onClick={handleConnect} disabled={loading}>
      {loading ? 'Connecting...' : 'Connect Jira'}
    </Button>
  );
}
