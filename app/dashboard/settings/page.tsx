import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { ConnectJiraButton } from '@/components/connect-jira-button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { auth } from '@/lib/auth';
import { getJiraAccount } from '@/lib/jira';
import { CheckCircle2, Mail, User, XCircle } from 'lucide-react';

export default async function SettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/auth/signin');
  }

  // Check Jira connection
  let jiraAccount = null;
  try {
    jiraAccount = await getJiraAccount(session.user.id);
  } catch (error) {
    // Not connected
  }

  return (
    <div className='space-y-8'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>Settings</h1>
        <p className='text-muted-foreground mt-1'>
          Manage your account settings and integrations
        </p>
      </div>

      <div className='grid gap-6 md:grid-cols-2'>
        {/* User Information */}
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <Label className='flex items-center gap-2 text-muted-foreground'>
                <User className='h-4 w-4' />
                Name
              </Label>
              <p className='text-sm font-medium'>{session.user.name}</p>
            </div>
            <div className='space-y-2'>
              <Label className='flex items-center gap-2 text-muted-foreground'>
                <Mail className='h-4 w-4' />
                Email
              </Label>
              <p className='text-sm font-medium'>{session.user.email}</p>
            </div>
            <div className='space-y-2'>
              <Label className='text-muted-foreground'>User ID</Label>
              <p className='text-xs font-mono text-muted-foreground/70'>
                {session.user.id}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Jira Integration */}
        <Card>
          <CardHeader>
            <CardTitle>Jira Integration</CardTitle>
            <CardDescription>Connect your Jira workspace</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center justify-between p-4 rounded-lg border'>
              <div className='flex items-center gap-3'>
                {jiraAccount ? (
                  <>
                    <div className='h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center'>
                      <CheckCircle2 className='h-5 w-5 text-green-500' />
                    </div>
                    <div>
                      <p className='text-sm font-medium'>Connected</p>
                      <p className='text-xs text-muted-foreground'>
                        Jira account is linked
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className='h-10 w-10 rounded-full bg-muted flex items-center justify-center'>
                      <XCircle className='h-5 w-5 text-muted-foreground' />
                    </div>
                    <div>
                      <p className='text-sm font-medium'>Not Connected</p>
                      <p className='text-xs text-muted-foreground'>
                        No Jira account linked
                      </p>
                    </div>
                  </>
                )}
              </div>
              {!jiraAccount && <ConnectJiraButton />}
            </div>

            {jiraAccount && (
              <div className='space-y-2 p-4 rounded-lg bg-muted/50'>
                <Label className='text-muted-foreground text-xs'>
                  Connection Details
                </Label>
                <div className='space-y-1'>
                  <p className='text-xs font-mono text-muted-foreground'>
                    Provider: {jiraAccount.providerId}
                  </p>
                  <p className='text-xs font-mono text-muted-foreground'>
                    Account ID: {jiraAccount.accountId}
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    Connected:{' '}
                    {new Date(jiraAccount.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
