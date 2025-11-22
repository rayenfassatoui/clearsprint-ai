import { headers } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import * as motion from 'framer-motion/client';
import { ConnectJiraButton } from '@/features/jira/components/connect-jira-button';
import { CreateProjectDialog } from '@/features/projects/components/create-project-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { projects } from '@/lib/db/schema';
import { eq, count, desc } from 'drizzle-orm';
import {
  ArrowRight,
  FolderKanban,
  Plus,
  Sparkles,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getJiraAccount } from '@/lib/jira';
import { Badge } from '@/components/ui/badge';

async function getDashboardStats(userId: string) {
  const [projectCount] = await db
    .select({ count: count() })
    .from(projects)
    .where(eq(projects.userId, userId));

  const recentProjects = await db
    .select()
    .from(projects)
    .where(eq(projects.userId, userId))
    .orderBy(desc(projects.id))
    .limit(3);

  return {
    projectCount: projectCount.count,
    recentProjects,
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
  } catch {
    // Ignore error
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Hero Section */}
      <motion.div
        variants={item}
        className="relative overflow-hidden rounded-3xl bg-linear-to-r from-primary/20 via-primary/10 to-background p-8 md:p-12 border border-primary/10"
      >
        <div className="absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-primary/20 blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl opacity-50" />

        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-4">
            <Badge
              variant="outline"
              className="bg-background/50 backdrop-blur-md border-primary/20 text-primary"
            >
              <Sparkles className="mr-1 h-3 w-3" />
              AI-Powered Dashboard
            </Badge>
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4 bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/70">
            Welcome back, {session.user.name}
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            {jiraConnected
              ? `Ready to transform your ideas into actionable sprint tickets? You have ${stats.projectCount} active projects.`
              : 'Connect Jira to unlock the full power of AI-driven sprint planning and two-way synchronization.'}
          </p>

          <div className="flex flex-wrap gap-4">
            {jiraConnected ? (
              <CreateProjectDialog
                jiraConnected={jiraConnected}
                trigger={
                  <Button
                    size="lg"
                    className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    New Project
                  </Button>
                }
              />
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="scale-110 origin-left">
                  <ConnectJiraButton />
                </div>
                <p className="text-sm text-muted-foreground max-w-xs">
                  * Required to sync tickets and enable AI features.
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        <motion.div variants={item}>
          <Card className="overflow-hidden border-muted/60 bg-card/50 backdrop-blur-sm hover:border-primary/20 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Projects
              </CardTitle>
              <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <FolderKanban className="h-4 w-4 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.projectCount}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center">
                <span className="text-emerald-500 flex items-center mr-1">
                  <Zap className="h-3 w-3 mr-0.5" />
                  Active
                </span>
                in workspace
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="overflow-hidden border-muted/60 bg-card/50 backdrop-blur-sm hover:border-primary/20 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Jira Status
              </CardTitle>
              <div
                className={`h-8 w-8 rounded-lg flex items-center justify-center ${jiraConnected ? 'bg-emerald-500/10' : 'bg-orange-500/10'}`}
              >
                <div
                  className={`h-2.5 w-2.5 rounded-full ${jiraConnected ? 'bg-emerald-500' : 'bg-orange-500 animate-pulse'}`}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {jiraConnected ? 'Active' : 'Pending'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {jiraConnected
                  ? 'Sync enabled & ready'
                  : 'Connect to sync items'}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="overflow-hidden border-muted/60 bg-card/50 backdrop-blur-sm hover:border-primary/20 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                AI Usage
              </CardTitle>
              <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-purple-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">Unlimited</div>
              <p className="text-xs text-muted-foreground mt-1">
                Premium plan active
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-8 md:grid-cols-3">
        {/* Recent Projects */}
        <motion.div variants={item} className="md:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight">
              Recent Projects
            </h2>
            <Link
              href="/dashboard/projects-list"
              className="text-sm text-primary hover:underline flex items-center"
            >
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-4">
            {stats.recentProjects.length > 0 ? (
              stats.recentProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/dashboard/projects/${project.id}`}
                >
                  <Card className="group hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-6 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center group-hover:scale-105 transition-transform">
                          <FolderKanban className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                            {project.name || 'Untitled Project'}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {project.description || 'No description provided'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                          <p className="text-xs text-muted-foreground">
                            Last updated
                          </p>
                          <p className="text-sm font-medium">Just now</p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <Card className="border-dashed border-2 bg-transparent">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                    <FolderKanban className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg mb-1">
                    No projects yet
                  </h3>
                  <p className="text-muted-foreground mb-4 max-w-xs">
                    Create your first project to start generating tickets with
                    AI.
                  </p>
                  {jiraConnected ? (
                    <CreateProjectDialog
                      jiraConnected={jiraConnected}
                      trigger={
                        <Button>
                          <Plus className="mr-2 h-4 w-4" />
                          Create Project
                        </Button>
                      }
                    />
                  ) : (
                    <div className="opacity-50 cursor-not-allowed">
                      <Button disabled>Connect Jira First</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </motion.div>

        {/* Quick Actions Sidebar */}
        <motion.div variants={item} className="space-y-6">
          <h2 className="text-xl font-semibold tracking-tight">
            Quick Actions
          </h2>

          <Card className="bg-linear-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Pro Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p className="mb-2">Did you know?</p>
                <p>
                  You can upload PDF PRDs directly to generate comprehensive
                  backlogs in seconds.
                </p>
              </div>
              <Button
                variant="ghost"
                className="w-full text-primary hover:text-primary hover:bg-primary/10"
                size="sm"
              >
                Learn more
              </Button>
            </CardContent>
          </Card>

          {jiraConnected && (
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-base">Connection Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm font-medium text-emerald-600">
                      Jira Connected
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-4 justify-start"
                  asChild
                >
                  <Link href="/dashboard/test">
                    <Zap className="mr-2 h-4 w-4" />
                    Test API Connection
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
