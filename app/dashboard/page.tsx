import { headers } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import * as motion from 'framer-motion/client';
import { CreateProjectDialog } from '@/features/projects/components/create-project-dialog';
import { checkLinearConnectionStatus } from '@/features/auth/actions/user.server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { projects } from '@/lib/db/schema';
import { eq, count, desc } from 'drizzle-orm';
import { ArrowRight, FolderKanban, Plus, Sparkles, Zap, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  const linearStatus = await checkLinearConnectionStatus();

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
      initial='hidden'
      animate='show'
      className='space-y-8'
    >
      {/* Hero Section */}
      <motion.div
        variants={item}
        className='relative overflow-hidden rounded-3xl bg-linear-to-r from-primary/20 via-primary/10 to-background p-8 md:p-12 border border-primary/10'
      >
        <div className='absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-primary/20 blur-3xl opacity-50' />
        <div className='absolute bottom-0 left-0 -mb-16 -ml-16 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl opacity-50' />

        <div className='relative z-10 max-w-2xl'>
          <div className='flex items-center gap-2 mb-4'>
            <Badge
              variant='outline'
              className='bg-background/50 backdrop-blur-md border-primary/20 text-primary'
            >
              <Sparkles className='mr-1 h-3 w-3' />
              AI-Powered Dashboard
            </Badge>
          </div>
          <h1 className='text-4xl font-bold tracking-tight mb-4 bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/70'>
            Welcome back, {session.user.name}
          </h1>
          <p className='text-lg text-muted-foreground mb-8'>
            Ready to transform your ideas into actionable sprint tickets? You
            have {stats.projectCount} active projects.
          </p>

          <div className='flex flex-col sm:flex-row flex-wrap gap-4'>
            <CreateProjectDialog
              trigger={
                <Button
                  size='lg'
                  className='rounded-full bg-linear-to-r from-[--linear] to-indigo-600 text-white hover:opacity-90 shadow-lg shadow-indigo-500/25 border border-indigo-500/20 px-8 font-medium'
                >
                  <Sparkles className='mr-2 h-4 w-4' />
                  Import Linear Project
                </Button>
              }
            />
          </div>

          {!linearStatus.connected && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.2 }}
              className='mt-6 p-4 flex items-start gap-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl max-w-lg'
            >
              <AlertCircle className='h-5 w-5 text-amber-500 shrink-0 mt-0.5' />
              <div className='text-sm'>
                <p className='font-medium text-amber-600 dark:text-amber-400'>
                  Linear is not connected
                </p>
                <p className='text-amber-600/80 dark:text-amber-400/80 mt-1'>
                  Connect your workspace to generate and sync AI tickets. <Link href="/dashboard/settings" className="font-semibold underline underline-offset-2 hover:text-amber-700 dark:hover:text-amber-300">Go to Settings &rarr;</Link>
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className='grid gap-6 md:grid-cols-3'>
        <motion.div variants={item}>
          <Card className='overflow-hidden border-muted/60 bg-card/50 backdrop-blur-sm hover:border-primary/20 transition-colors'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                Total Projects
              </CardTitle>
              <div className='h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center'>
                <FolderKanban className='h-4 w-4 text-blue-500' />
              </div>
            </CardHeader>
            <CardContent>
              <div className='text-3xl font-bold'>{stats.projectCount}</div>
              <p className='text-xs text-muted-foreground mt-1 flex items-center'>
                <span className='text-emerald-500 flex items-center mr-1'>
                  <Zap className='h-3 w-3 mr-0.5' />
                  Active
                </span>
                in workspace
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className='overflow-hidden border-muted/60 bg-card/50 backdrop-blur-sm hover:border-primary/20 transition-colors'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                AI Usage
              </CardTitle>
              <div className='h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center'>
                <Sparkles className='h-4 w-4 text-purple-500' />
              </div>
            </CardHeader>
            <CardContent>
              <div className='text-3xl font-bold'>Unlimited</div>
              <p className='text-xs text-muted-foreground mt-1'>
                Premium plan active
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <div className='grid gap-8 md:grid-cols-3'>
        {/* Recent Projects */}
        <motion.div variants={item} className='md:col-span-2 space-y-6'>
          <div className='flex items-center justify-between'>
            <h2 className='text-xl font-semibold tracking-tight'>
              Recent Projects
            </h2>
            <Link
              href='/dashboard/projects-list'
              className='text-sm text-primary hover:underline flex items-center'
            >
              View all <ArrowRight className='ml-1 h-4 w-4' />
            </Link>
          </div>

          <div className='grid gap-4'>
            {stats.recentProjects.length > 0 ? (
              stats.recentProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/dashboard/workspace/${project.id}`}
                >
                  <Card className='group hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 bg-card/50 backdrop-blur-sm'>
                    <CardContent className='p-6 flex items-center justify-between'>
                      <div className='flex items-center gap-4'>
                        <div className='h-12 w-12 rounded-2xl bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center group-hover:scale-105 transition-transform'>
                          <FolderKanban className='h-6 w-6 text-primary' />
                        </div>
                        <div>
                          <h3 className='font-semibold text-lg group-hover:text-primary transition-colors'>
                            {project.name || 'Untitled Project'}
                          </h3>
                          <p className='text-sm text-muted-foreground line-clamp-1'>
                            {project.description || 'No description provided'}
                          </p>
                        </div>
                      </div>
                      <div className='flex items-center gap-4'>
                        <div className='text-right hidden sm:block'>
                          <p className='text-xs text-muted-foreground'>
                            Last updated
                          </p>
                          <p className='text-sm font-medium'>Just now</p>
                        </div>
                        <ArrowRight className='h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all' />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <Card className='border-dashed border-2 bg-transparent'>
                <CardContent className='flex flex-col items-center justify-center py-12 text-center'>
                  <div className='h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4'>
                    <FolderKanban className='h-6 w-6 text-muted-foreground' />
                  </div>
                  <h3 className='font-semibold text-lg mb-1'>
                    No projects yet
                  </h3>
                  <p className='text-muted-foreground mb-4 max-w-xs'>
                    Create your first project to start generating tickets with
                    AI.
                  </p>
                  <CreateProjectDialog
                    trigger={
                      <Button>
                        <Plus className='mr-2 h-4 w-4' />
                        Create Project
                      </Button>
                    }
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </motion.div>

        {/* Quick Actions Sidebar */}
        <motion.div variants={item} className='space-y-6'>
          <h2 className='text-xl font-semibold tracking-tight'>
            Quick Actions
          </h2>

          <Card className='bg-linear-to-br from-primary/10 via-primary/5 to-transparent border-primary/20'>
            <CardHeader>
              <CardTitle className='text-base flex items-center gap-2'>
                <Sparkles className='h-4 w-4 text-primary' />
                Pro Tips
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='text-sm text-muted-foreground'>
                <p className='mb-2'>Did you know?</p>
                <p>
                  You can upload PDF PRDs directly to generate comprehensive
                  backlogs in seconds.
                </p>
              </div>
              <Button
                variant='ghost'
                className='w-full text-primary hover:text-primary hover:bg-primary/10'
                size='sm'
              >
                Learn more
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
