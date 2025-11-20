'use client';

import { Sparkles } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface LandingNavProps {
  isAuthenticated: boolean;
}

const LogoMark = () => (
  <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 dark:bg-primary/10 text-primary ring-1 ring-primary/30 shadow-lg dark:shadow-[0_0_45px_rgba(16,185,129,0.4)]">
    <svg
      viewBox="0 0 1024 1024"
      xmlns="http://www.w3.org/2000/svg"
      className="h-12 w-12"
      fill="currentColor"
      aria-hidden
    >
      <path d="M270.31 351.85c115.23-.04 230.46-.01 345.69-.02 48.31-.07 96.61.14 144.92-.1-49.42 53.32-98.56 106.9-148.12 160.1 44.46 47.96 89.35 95.52 134.04 143.29 5.01 5.51 10.37 10.7 15.21 16.37-12.64.76-25.36.2-38.02.37-151.23-.03-302.47-.01-453.7-.01-.01-106.67-.02-213.34-.02-320m66.94 65.32c-.17 63.07-.08 126.13-.07 189.19 87.04.28 174.09.01 261.13.14-29.37-31.41-58.91-62.67-88.17-94.19 11.11-12.25 22.52-24.23 33.85-36.28 18.08-19.84 36.86-39.05 54.68-59.11-3.56.3-7.13.34-10.69.29-83.58-.04-167.16.02-250.73-.04" />
    </svg>
  </div>
);

export function LandingNav({ isAuthenticated }: LandingNavProps) {
  return (
    <header className="flex flex-col gap-12 lg:flex-row lg:items-start lg:justify-between">
      <div className="flex items-start gap-6">
        <LogoMark />
        <div className="space-y-3 pt-1">
          <Badge className="border-primary/40 bg-primary/10 text-primary text-xs font-medium">
            ClearSprint AI
          </Badge>
          <p className="text-sm text-foreground/70 dark:text-muted-foreground leading-relaxed max-w-xs">
            Espace de travail intelligent pour des équipes collaboratives
            livrant dans les délais.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
        <div className="items-center gap-3 text-xs text-foreground/60 dark:text-muted-foreground whitespace-nowrap hidden sm:flex">
          <Sparkles className="h-4 w-4 text-primary shrink-0" aria-hidden />
          <span>
            Optimisé pour la feuille de route de lancement sur 45 jours
          </span>
        </div>
        <ThemeToggle />
        {isAuthenticated ? (
          <Button
            asChild
            className="bg-emerald-500 text-black hover:bg-emerald-400"
          >
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        ) : (
          <>
            <Button
              asChild
              variant="ghost"
              className="text-zinc-400 hover:text-white hover:bg-white/5"
            >
              <Link href="/auth/signin">Se connecter</Link>
            </Button>
            <Button
              asChild
              className="bg-emerald-500 text-black hover:bg-emerald-400"
            >
              <Link href="/auth/signup">S'inscrire</Link>
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
