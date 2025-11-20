import { headers } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ConnectJiraButton } from '@/components/connect-jira-button';
import { ImportJiraModal } from '@/components/import-jira-modal';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { projects } from '@/lib/db/schema';
import { eq, count } from 'drizzle-orm';
import { ArrowRight, FolderKanban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getJiraAccount } from '@/lib/jira';

async function getDashboardStats(userId: string) {
  const [projectCount] = await db
    .select({ count: count() })
    .from(projects)
    .where(eq(projects.userId, userId));

  return {
    projectCount: projectCount.count,
  };
}

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/auth/signin');
  }

  const stats = await getDashboardStats(session.user.id);

  // Check Jira connection
  let jiraConnected = false;
  try {
    const jiraAccount = await getJiraAccount(session.user.id);
    jiraConnected = !!jiraAccount;
  } catch (error) {
    // Not connected
  }

  return (
    <div className='space-y-8'>
      {/* Welcome Header */}
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>
          Welcome back, {session.user.name}
        </h1>
        <p className='text-muted-foreground mt-1'>
          Here's what's happening with your projects today
        </p>
      </div>

      {/* Quick Stats */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Total Projects
            </CardTitle>
            <FolderKanban className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.projectCount}</div>
            <p className='text-xs text-muted-foreground mt-1'>
              Across all workspaces
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Jira Integration
            </CardTitle>
            <div
              className={`h-2 w-2 rounded-full ${jiraConnected ? 'bg-green-500' : 'bg-muted'
                }`}
            />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {jiraConnected ? 'Connected' : 'Not Connected'}
            </div>
            <p className='text-xs text-muted-foreground mt-1'>
              {jiraConnected ? 'Sync enabled' : 'Connect to sync work items'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className='grid gap-4 md:grid-cols-2'>
        <Card className='hover:bg-accent/50 transition-colors cursor-pointer group'>
          <Link href='/dashboard/projects-list'>
            <CardHeader>
              <CardTitle className='flex items-center justify-between'>
                View All Projects
                <ArrowRight className='h-4 w-4 group-hover:translate-x-1 transition-transform' />
              </CardTitle>
              <CardDescription>
                Manage and organize your sprint projects
              </CardDescription>
            </CardHeader>
          </Link>
        </Card>

        <Card className='hover:bg-accent/50 transition-colors'>
          <CardHeader>
            <CardTitle>Jira Integration</CardTitle>
            <CardDescription className='flex items-center justify-between'>
              <span>Connect your Jira workspace</span>
              <div className="flex gap-2">
                {!jiraConnected && <ConnectJiraButton />}
                {jiraConnected && (
                  <>
                    <ImportJiraModal />
                    <Link href='/dashboard/test'>
                      <Button variant='outline' size='sm'>
                        Test API
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
