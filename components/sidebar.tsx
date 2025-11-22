'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BeakerIcon,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import { UserProfile } from '@/features/auth/components/user-profile';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { authClient } from '@/lib/auth-client';
import { cn } from '@/lib/utils';
import { LogoMark } from '@/features/landing/components/landing-nav';
import { Spinner } from '@/components/ui/spinner';

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Projects',
    href: '/dashboard/projects-list',
    icon: FolderKanban,
  },
  {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
  {
    name: 'Test Jira API',
    href: '/dashboard/test',
    icon: BeakerIcon,
  },
];

export function Sidebar({ className, user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
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
    <Link href={href} className="block w-full">
      <div className="relative group">
        {isActive && (
          <motion.div
            layoutId="activeNav"
            className="absolute inset-0 bg-primary/10 rounded-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              type: 'spring',
              stiffness: 380,
              damping: 30,
            }}
          />
        )}
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start relative z-10 transition-all duration-200',
            isActive
              ? 'text-primary font-medium'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <Icon className={cn('mr-2 h-4 w-4', isActive && 'text-primary')} />
          <span className="truncate">{label}</span>
        </Button>
      </div>
    </Link>
  );

  return (
    <div
      className={cn(
        'h-full flex flex-col bg-card/50 backdrop-blur-xl border-r border-border/50 overflow-x-hidden',
        className,
      )}
    >
      {/* Header */}
      <div className="px-3 py-4">
        <div className="flex items-center px-4 gap-3">
          <LogoMark className="size-8 rounded-lg" />
          <h2 className="text-lg font-bold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-primary to-primary/60">
            ClearSprint AI
          </h2>
        </div>
      </div>

      <Separator className="mx-3" />

      {/* Navigation */}
      <div className="flex-1 px-3 py-4 flex flex-col gap-4">
        <div className="space-y-1">
          {navigation.map((item) => (
            <NavItem
              key={item.name}
              href={item.href}
              icon={item.icon}
              label={item.name}
              isActive={
                pathname === item.href ||
                (item.href !== '/dashboard' && pathname.startsWith(item.href))
              }
            />
          ))}
        </div>

        {/* Upgrade Card */}
        <div className="mt-auto mx-1">
          <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-linear-to-br from-primary/10 via-primary/5 to-transparent p-4">
            <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-transparent to-transparent opacity-50" />
            <div className="relative z-10 space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-primary ring-1 ring-primary/30">
                  <Sparkles className="h-4 w-4" />
                </div>
                <h3 className="font-semibold text-sm">Go Premium</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Unlock unlimited AI generations and advanced Jira sync.
              </p>
              <Button
                size="sm"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
              >
                Upgrade Now
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-border/50 bg-background/50 space-y-3">
        {/* Theme Toggle */}
        <div className="px-4 py-2 flex items-center justify-between rounded-lg hover:bg-accent/50 transition-colors">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Settings className="h-4 w-4" />
            <span>Theme</span>
          </div>
          <ThemeToggle />
        </div>

        {/* User Profile */}
        <UserProfile user={user} />

        {/* Sign Out */}
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
          onClick={handleSignOut}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <Spinner className="mr-2 h-4 w-4" />
          ) : (
            <LogOut className="mr-2 h-4 w-4" />
          )}
          {isLoggingOut ? 'Signing out...' : 'Sign Out'}
        </Button>
      </div>
    </div>
  );
}

export function MobileNav({ user }: { user: SidebarProps['user'] }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden hover:bg-accent/50"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0 p-0 w-72">
        <Sidebar user={user} className="border-none" />
      </SheetContent>
    </Sheet>
  );
}
