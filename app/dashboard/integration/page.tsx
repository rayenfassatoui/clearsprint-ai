import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getJiraAccount, disconnectJiraAccount } from '@/lib/jira';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConnectJiraButton } from '@/features/jira/components/connect-jira-button';
import { CheckCircle2, XCircle, LogOut, Link as LinkIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

async function disconnectJira(_formData: FormData) {
  'use server';
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return;
  }

  try {
    await disconnectJiraAccount(session.user.id);
  } catch (error) {
    console.error('Failed to disconnect Jira:', error);
  }
}

export default async function IntegrationPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/auth/signin');
  }

  const user = session.user;

  // Check Jira connection
  let jiraAccount = null;
  let jiraConnected = false;
  try {
    jiraAccount = await getJiraAccount(user.id);
    jiraConnected = !!jiraAccount;
  } catch (error) {
    console.error('Error fetching Jira account:', error);
  }

  return (
    <div className="w-full space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account and connected services
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* User Profile Section */}
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
                <AvatarImage src={user.image || undefined} alt={user.name} />
                <AvatarFallback className="text-3xl bg-primary/10">
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h3 className="font-semibold text-xl">{user.name}</h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">User ID</span>
                <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                  {user.id.slice(0, 8)}...
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Account Type</span>
                <Badge variant="secondary">Free Plan</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Integrations Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5 text-primary" />
                <CardTitle>Connected Services</CardTitle>
              </div>
              <CardDescription>
                Manage your connections to external tools and services
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Jira Integration Item */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 rounded-xl border bg-card/50 hover:bg-card/80 transition-colors gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`h-12 w-12 rounded-xl flex items-center justify-center transition-colors ${
                      jiraConnected
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {jiraConnected ? (
                      <CheckCircle2 className="h-6 w-6" />
                    ) : (
                      <XCircle className="h-6 w-6" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">Jira Software</h3>
                      <Badge
                        variant={jiraConnected ? 'default' : 'secondary'}
                        className={
                          jiraConnected
                            ? 'bg-emerald-500 hover:bg-emerald-600'
                            : ''
                        }
                      >
                        {jiraConnected ? 'Connected' : 'Not Connected'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground max-w-md">
                      {jiraConnected
                        ? 'Sync projects, issues, and sprints directly from your Jira workspace.'
                        : 'Connect to import projects and keep your backlog in sync.'}
                    </p>
                  </div>
                </div>

                <div className="shrink-0">
                  {jiraConnected ? (
                    <form action={disconnectJira}>
                      <Button
                        type="submit"
                        variant="outline"
                        className="gap-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50"
                      >
                        <LogOut className="h-4 w-4" />
                        Disconnect
                      </Button>
                    </form>
                  ) : (
                    <ConnectJiraButton />
                  )}
                </div>
              </div>

              {jiraConnected && jiraAccount && (
                <div className="rounded-xl bg-muted/30 border p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">Provider</p>
                    <p className="font-medium flex items-center gap-2">
                      Atlassian
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Account ID</p>
                    <p
                      className="font-mono text-xs truncate"
                      title={jiraAccount.accountId}
                    >
                      {jiraAccount.accountId}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Connected On</p>
                    <p className="font-medium">
                      {new Date(jiraAccount.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
