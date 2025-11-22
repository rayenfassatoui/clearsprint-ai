'use client';

import { Sparkles } from 'lucide-react';
import type React from 'react';
import Particles from '@/features/landing/components/particles';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background font-sans text-foreground selection:bg-primary/20">
      {/* Background Particles */}
      <div className="absolute inset-0 z-0">
        <Particles
          particleCount={300}
          particleSpread={15}
          speed={0.2}
          particleBaseSize={150}
          moveParticlesOnHover={true}
          particleHoverFactor={1.5}
          alphaParticles={true}
          className="h-full w-full"
        />
      </div>

      {/* Gradient Overlay for depth */}
      <div className="grid min-h-screen w-full lg:grid-cols-2">
        {/* Left Column - Auth Form */}
        <div className="relative flex flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
          {/* Mobile Background Pattern */}
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-primary/20 via-background to-background lg:hidden" />
          <div className="mx-auto w-full max-w-sm lg:w-96">
            <div className="mb-10">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
                <Sparkles className="h-6 w-6" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground">
                {title}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
            </div>
            {children}
          </div>
        </div>

        {/* Right Column - Decorative */}
        <div className="relative hidden w-full flex-col bg-muted p-10 text-white dark:border-l lg:flex">
          <div className="absolute inset-0 bg-zinc-900" />
          <div className="absolute inset-0 bg-linear-to-br from-zinc-900 via-zinc-900/90 to-zinc-900/50" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center mask-[linear-gradient(180deg,white,rgba(255,255,255,0))]" />

          {/* Abstract Shapes */}
          <div className="absolute -left-[20%] top-0 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[100px]" />
          <div className="absolute -right-[20%] bottom-0 h-[500px] w-[500px] rounded-full bg-blue-500/20 blur-[100px]" />

          <div className="relative z-20 flex h-full flex-col justify-between">
            <div className="flex items-center gap-2 text-lg font-medium">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/20">
                <Sparkles className="h-4 w-4" />
              </div>
              ClearSprint AI
            </div>

            <div className="space-y-6">
              <blockquote className="space-y-2">
                <div className="relative">
                  <div className="absolute -left-4 -top-4 text-6xl text-primary/20">
                    &quot;
                  </div>
                  <p className="relative text-xl font-medium leading-relaxed">
                    <span className="bg-linear-to-b from-white to-white/70 bg-clip-text text-transparent">
                      Transform your project management with AI-driven insights.
                      From chaos to clarity in seconds.
                    </span>
                  </p>
                </div>
                <footer className="text-sm text-zinc-400">
                  The Future of Agile
                </footer>
              </blockquote>
              <div className="flex gap-2">
                <div className="h-1 w-8 rounded-full bg-primary" />
                <div className="h-1 w-2 rounded-full bg-primary/30" />
                <div className="h-1 w-2 rounded-full bg-primary/30" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
