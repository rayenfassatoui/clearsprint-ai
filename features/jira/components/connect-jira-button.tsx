'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';

export function ConnectJiraButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleConnect = async () => {
    setLoading(true);

    try {
      // Use linkSocial instead of signIn.social to link to current user
      const result = await authClient.linkSocial({
        provider: 'atlassian',
        callbackURL: '/dashboard/integration',
      });

      if (result.error) {
        console.error('Jira OAuth Error:', result.error);
        toast.error(result.error.message || 'Failed to connect to Jira');
        setLoading(false);
        return;
      }

      toast.success('Connected to Jira successfully');
      router.refresh();
      setLoading(false);
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
