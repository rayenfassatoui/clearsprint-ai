import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import * as motion from 'framer-motion/client';
import { auth } from '@/lib/auth';
import { checkLinearConnectionStatus } from '@/features/auth/actions/user.server';
import { ConnectLinearButton } from '@/features/linear-sync/components/connect-linear-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Layers, Link as LinkIcon, Settings as SettingsIcon, Shield, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default async function SettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/auth/signin');
  }

  const linearStatus = await checkLinearConnectionStatus();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
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
      className='space-y-8 max-w-5xl mx-auto'
    >
      {/* Header */}
      <motion.div variants={item} className='space-y-2 max-w-3xl'>
        <div className='flex items-center gap-2 mb-2'>
          <Badge
            variant='outline'
            className='bg-muted/50 backdrop-blur-md border-border/50 text-muted-foreground'
          >
            <SettingsIcon className='mr-1.5 h-3 w-3 text-[--linear]' />
            Settings
          </Badge>
        </div>
        <h1 className='text-3xl font-bold tracking-tight'>Integration & Settings</h1>
        <p className='text-muted-foreground text-lg'>
          Manage your account preferences and external integrations.
        </p>
      </motion.div>

      <div className='grid gap-8 md:grid-cols-[250px_1fr] lg:grid-cols-[300px_1fr]'>
        {/* Sidebar Nav (Static for now, but gives the settings page structure) */}
        <motion.nav variants={item} className='flex flex-col gap-1 pr-4'>
          <Button variant='secondary' className='justify-start bg-[--linear]/10 text-[--linear] hover:bg-[--linear]/20 font-medium'>
            <LinkIcon className='mr-2.5 h-4 w-4' />
            Integrations
          </Button>
          <Button variant='ghost' className='justify-start text-muted-foreground hover:text-foreground hover:bg-muted/50'>
            <Shield className='mr-2.5 h-4 w-4' />
            Profile & Security
          </Button>
          <Button variant='ghost' className='justify-start text-muted-foreground hover:text-foreground hover:bg-muted/50'>
            <Sparkles className='mr-2.5 h-4 w-4' />
            Subscription
          </Button>
        </motion.nav>

        {/* Settings Content */}
        <motion.div variants={item} className='space-y-6 max-w-3xl'>
          {/* Linear Integration Card */}
          <Card className='border-border/50 overflow-hidden relative bg-card shadow-sm'>
            <div className='absolute top-0 right-0 -mt-10 -mr-10 h-32 w-32 rounded-full bg-[--linear]/10 blur-3xl opacity-60' />
            
            <CardHeader>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <div className='h-10 w-10 rounded-xl bg-linear-to-br from-[#5E6AD2]/20 to-[#4E5BCE]/5 flex items-center justify-center border border-[#5E6AD2]/20'>
                    <Layers className='h-5 w-5 text-[#5E6AD2]' />
                  </div>
                  <div>
                    <CardTitle className='text-xl'>Linear Integration</CardTitle>
                    <CardDescription className='mt-1'>
                      Connect your Linear workspace to import projects and generate AI tickets directly.
                    </CardDescription>
                  </div>
                </div>
                {linearStatus.connected && (
                  <Badge className='bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20 px-3 py-1'>
                    Connected
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className='space-y-6 pt-4 border-t border-border/50'>
              <div className='grid gap-6 md:grid-cols-2'>
                <div className='space-y-3 bg-background/50 p-4 rounded-xl border border-border/50'>
                  <Label className='text-xs text-muted-foreground uppercase tracking-wider font-semibold'>Connection Status</Label>
                  <div className='flex items-center gap-2'>
                    {linearStatus.connected ? (
                      <div className='flex items-center gap-2'>
                        <div className='h-2 w-2 rounded-full bg-emerald-500 animate-pulse' />
                        <span className='font-medium text-emerald-600 dark:text-emerald-400'>Workspace linked successfully</span>
                      </div>
                    ) : (
                      <div className='flex items-center gap-2'>
                        <div className='h-2 w-2 rounded-full bg-muted-foreground' />
                        <span className='text-muted-foreground'>Not connected to any workspace</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className='space-y-3 bg-background/50 p-4 rounded-xl border border-border/50'>
                  <Label className='text-xs text-muted-foreground uppercase tracking-wider font-semibold'>Actions</Label>
                  <div className='pt-1'>
                    <ConnectLinearButton connected={linearStatus.connected} className="w-full" />
                  </div>
                </div>
              </div>

              {!linearStatus.connected && (
                <div className='bg-primary/5 border border-primary/10 p-4 rounded-xl mt-4'>
                  <h4 className='font-medium mb-1 text-primary'>Why connect Linear?</h4>
                  <p className='text-sm text-muted-foreground'>
                    ClearSprint natively integrates with Linear to provide two-way sync for issues, labels, and states. Generate comprehensive product backlogs using AI and immediately push them into your Linear cycles.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Profile Quick Settings (Read-Only Preview) */}
          <Card className='border-border/50 bg-card shadow-sm'>
            <CardHeader>
              <CardTitle className='text-xl'>Account Email</CardTitle>
              <CardDescription>
                The primary email address associated with your account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='flex items-center gap-4'>
                <Input value={session.user.email} disabled className='max-w-md bg-background/50' />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
