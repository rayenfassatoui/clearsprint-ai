'use client';

import { motion } from 'framer-motion';
import {
  FolderOpen,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { authClient } from '@/lib/auth-client';
import { cn } from '@/lib/utils';

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  projects: { id: number; name: string | null }[];
}

export function Sidebar({ className, projects }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push('/auth/signin');
  };

  interface NavItemProps {
    href: string;
    icon: React.ElementType;
    label: string;
    isActive: boolean;
  }

  const NavItem = ({ href, icon: Icon, label, isActive }: NavItemProps) => (
    <Link href={href} className='block w-full'>
      <div className='relative group'>
        {isActive && (
          <motion.div
            layoutId='activeNav'
            className='absolute inset-0 bg-primary/10 rounded-lg'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
        <Button
          variant='ghost'
          className={cn(
            'w-full justify-start relative z-10 transition-all duration-200',
            isActive
              ? 'text-primary font-medium'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Icon className={cn('mr-2 h-4 w-4', isActive && 'text-primary')} />
          <span className='truncate'>{label}</span>
        </Button>
      </div>
    </Link>
  );

  return (
    <div
      className={cn(
        'pb-12 h-full flex flex-col bg-card/50 backdrop-blur-xl border-r border-border/50',
        className
      )}
    >
      <div className='space-y-4 py-4 flex-1'>
        <div className='px-3 py-2'>
          <div className='flex items-center px-4 mb-6 gap-2'>
            <div className='h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center'>
              <Sparkles className='h-4 w-4 text-primary' />
            </div>
            <h2 className='text-lg font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60'>
              ClearSprint AI
            </h2>
          </div>
          <div className='space-y-1'>
            <NavItem
              href='/dashboard'
              icon={LayoutDashboard}
              label='Dashboard'
              isActive={pathname === '/dashboard'}
            />
          </div>
        </div>
        <div className='px-3 py-2'>
          <h2 className='mb-2 px-4 text-xs font-semibold tracking-wider text-muted-foreground uppercase'>
            Projects
          </h2>
          <ScrollArea className='h-[300px] px-1'>
            <div className='space-y-1'>
              {projects.map((project) => (
                <NavItem
                  key={project.id}
                  href={`/dashboard/projects/${project.id}`}
                  icon={FolderOpen}
                  label={project.name || 'Untitled Project'}
                  isActive={pathname === `/dashboard/projects/${project.id}`}
                />
              ))}
              {projects.length === 0 && (
                <div className='px-4 py-8 text-center'>
                  <p className='text-sm text-muted-foreground'>
                    No projects yet.
                  </p>
                  <p className='text-xs text-muted-foreground/50 mt-1'>
                    Create one to get started.
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      <div className='px-3 py-4 mt-auto border-t border-border/50 bg-background/50'>
        <div className='space-y-1'>
          <div className='px-4 py-2 flex items-center justify-between rounded-lg hover:bg-accent/50 transition-colors'>
            <div className='flex items-center gap-2 text-sm font-medium text-muted-foreground'>
              <Settings className='h-4 w-4' />
              <span>Theme</span>
            </div>
            <ThemeToggle />
          </div>
          <Button
            variant='ghost'
            className='w-full justify-start text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors'
            onClick={handleSignOut}
          >
            <LogOut className='mr-2 h-4 w-4' />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}

export function MobileNav({
  projects,
}: {
  projects: { id: number; name: string | null }[];
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className='md:hidden hover:bg-accent/50'
        >
          <Menu className='h-5 w-5' />
          <span className='sr-only'>Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side='left' className='pr-0 p-0 w-72'>
        <Sidebar projects={projects} className='border-none' />
      </SheetContent>
    </Sheet>
  );
}
