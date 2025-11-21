import Image from 'next/image';
import Link from 'next/link';
import { LandingNav } from '@/components/landing-nav';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/auth';
import { AuthShader } from '@/components/ui/auth-shader';
import { BentoGrid } from '@/components/ui/bento-grid';
import DatabaseWithRestApi from '@/components/ui/database-with-rest-api';
import { LandingFooter } from '@/components/landing-footer';
import {
  FadeIn,
  FadeInItem,
  StaggerContainer,
} from '@/components/ui/motion-wrappers';
import { RoadmapTimeline } from '@/components/ui/roadmap-timeline';
import { TextHoverEffect } from '@/components/ui/text-hover-effect';
import { benefits, capabilities } from '@/lib/landing-copy';
import { headers } from 'next/headers';
import { VelocityText } from '@/components/ui/parallax-scrolling-text-effect';
import BackgroundEffects from '@/components/decorations/BackgroundEffects';
import LogoCloud from '@/components/logo-cloud';

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div className="relative min-h-screen overflow-hidden font-sans bg-background text-foreground">
      {/* Selective gradient overlays - theme aware */}
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-[60vh] bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.03),transparent_70%)] dark:bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.05),transparent_70%)]" />
      <div className="pointer-events-none absolute top-96 left-1/4 h-96 w-96 rounded-full bg-emerald-500/1.5 dark:bg-emerald-500/3 blur-3xl" />

      <BackgroundEffects particleCount={400} particleBaseSize={1} />

      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-16 px-8 py-12 md:px-12 ">
        <LandingNav isAuthenticated={!!session} />

        <section className="space-y-16">
          {/* Hero Content - Compact & Elegant */}
          <div className="z-10 relative grid gap-12 lg:grid-cols-2 lg:gap-12 items-center py-16 px-12 ">
            {/* Shader Background Effect */}
            <div className="absolute inset-0 -z-10 opacity-20 dark:opacity-30 pointer-events-none overflow-hidden rounded-3xl">
              <AuthShader />
            </div>

            <div className="space-y-8 relative z-10">
              <FadeIn delay={0.1} className="space-y-6">
                <h1 className="text-balance text-4xl font-bold leading-tight text-foreground sm:text-7xl tracking-tight">
                  Orchestrate every sprint with AI.
                </h1>
                <p className="text-pretty text-base text-foreground sm:text-lg leading-relaxed max-w-lg">
                  Centralize your projects, automate prioritization, and stay
                  ahead of risks with predictive analytics.
                </p>
              </FadeIn>

              <FadeIn
                delay={0.3}
                className="flex flex-col gap-4 sm:flex-row sm:items-center"
              >
                <Button
                  asChild
                  className="bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary/90 hover:scale-105 text-sm font-medium px-6 py-2.5"
                >
                  <Link href="/auth/signin">Start a project</Link>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  className="text-foreground hover:bg-primary/5 hover:text-primary transition-colors text-sm font-medium px-6 py-2.5"
                >
                  <Link href="#">View product backlog</Link>
                </Button>
              </FadeIn>
            </div>

            <FadeIn
              delay={0.5}
              direction="left"
              className="relative flex justify-center lg:justify-end"
            >
              <DatabaseWithRestApi
                title="Real-time AI Synchronization"
                circleText="AI"
                badgeTexts={{
                  first: 'Analysis',
                  second: 'Sprint',
                  third: 'Risks',
                  fourth: 'Optimization',
                }}
                buttonTexts={{
                  first: 'ClearSprint',
                  second: 'v1.0',
                }}
              />
            </FadeIn>
          </div>

          <LogoCloud />

          <VelocityText
            text="CLEARSPRINT AI • SHIP FASTER • PREDICT RISKS • GET SHIT DONE"
            defaultVelocity={10}
            className=" absolute bg-transparent py-12 -my-24 opacity-5 "
            size="md:text-[10em]"
            tilt={-2}
          />

          {/* Full Width Roadmap Cards */}
          {/* Roadmap Section */}
          <RoadmapTimeline />

          {/* Feature Showcase - Split Layout */}
          <section className="grid gap-12 lg:grid-cols-2 lg:items-center py-12">
            <FadeIn direction="right" className="space-y-8">
              <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
                <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse" />
                AI-Powered Sync
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Synchronize & Orchestrate{' '}
                <span className="text-primary">with AI</span>.
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Stop manually creating tickets. ClearSprint analyzes your PRDs,
                estimates difficulty, and syncs everything to Jira or Linear
                instantly.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                  </div>
                  <span className="text-sm font-medium">Bulk Generation</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <span className="text-sm font-medium">
                    Smart Difficulty Scoring
                  </span>
                </div>
              </div>
            </FadeIn>

            <FadeIn direction="left" delay={0.2}>
              <div className="group relative rounded-3xl border border-border/50 bg-card/50 p-2 shadow-2xl backdrop-blur-sm transition-all hover:scale-[1.02] hover:shadow-primary/10">
                <div className="absolute inset-0 -z-10 bg-linear-to-tr from-primary/20 via-primary/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 rounded-3xl" />
                <div className="relative aspect-video overflow-hidden rounded-2xl bg-muted">
                  <Image
                    src="https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1200&h=800&fit=crop"
                    alt="Collaborative team using ClearSprint"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Overlay UI Mockup Elements */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3 rounded-xl border border-white/10 bg-black/60 p-3 backdrop-blur-md">
                    <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30">
                      <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="h-1.5 w-24 rounded-full bg-white/20" />
                      <div className="h-1.5 w-16 rounded-full bg-white/10" />
                    </div>
                    <div className="text-xs font-medium text-white/80">
                      Just now
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </section>
        </section>

        <section className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-semibold text-foreground tracking-tight">
              Everything your team needs
            </h2>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              A complete platform that adapts to your workflow and boosts your
              productivity
            </p>
          </div>

          <BentoGrid items={capabilities} />
        </section>

        <div className="border-y border-border/50 bg-card/30 backdrop-blur-sm">
          <StaggerContainer className="grid gap-8 divide-y sm:divide-y-0 sm:divide-x divide-border/50 py-12 lg:grid-cols-3 max-w-7xl mx-auto px-8">
            {benefits.map((benefit) => (
              <FadeInItem
                key={benefit.label}
                className="flex flex-col items-center text-center space-y-4 px-4"
              >
                <div className="relative">
                  <p className="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-linear-to-b from-primary to-primary/40">
                    {benefit.metric}
                  </p>
                  <div className="absolute -inset-4 bg-primary/5 blur-2xl -z-10 rounded-full" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    {benefit.label}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-[250px] mx-auto">
                    {benefit.description}
                  </p>
                </div>
              </FadeInItem>
            ))}
          </StaggerContainer>
        </div>

        <section className="space-y-8 pt-12">
          <div className="text-center space-y-3">
            <h2 className="text-2xl font-semibold text-foreground">
              Designed for modern teams
            </h2>
            <p className="text-sm text-muted-foreground">
              Organizations worldwide are transforming their sprint management
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="group relative rounded-2xl overflow-hidden border border-primary/20 bg-linear-to-br from-primary/5 to-primary/10 p-1 hover:border-primary/40 transition-all duration-500 shadow-sm">
              <div className="relative rounded-xl overflow-hidden h-64 bg-muted">
                <Image
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop"
                  alt="Development team collaborating"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-linear-to-t from-background dark:from-background via-transparent to-transparent opacity-50 dark:opacity-70" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-sm font-semibold text-foreground">
                    Real-time collaboration
                  </p>
                </div>
              </div>
            </div>

            <div className="group relative rounded-2xl overflow-hidden border border-primary/20 bg-linear-to-br from-primary/5 to-primary/10 p-1 hover:border-primary/40 transition-all duration-500 shadow-sm">
              <div className="relative rounded-xl overflow-hidden h-64 bg-muted">
                <Image
                  src="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&h=400&fit=crop"
                  alt="Successful sprint planning"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-linear-to-t from-background dark:from-background via-transparent to-transparent opacity-50 dark:opacity-70" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-sm font-semibold text-foreground">
                    Intelligent planning
                  </p>
                </div>
              </div>
            </div>

            <div className="group relative rounded-2xl overflow-hidden border border-primary/20 bg-linear-to-br from-primary/5 to-primary/10 p-1 hover:border-primary/40 transition-all duration-500 shadow-sm">
              <div className="relative rounded-xl overflow-hidden h-64 bg-muted">
                <Image
                  src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&h=400&fit=crop"
                  alt="Performance tracking"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-linear-to-t from-background dark:from-background via-transparent to-transparent opacity-50 dark:opacity-70" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-sm font-semibold text-foreground">
                    Live analysis
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <VelocityText
          text="AUTOMATE YOUR WORKFLOW • ELIMINATE BUSYWORK • FOCUS ON BUILDING"
          defaultVelocity={50}
          className="py-12 opacity-5"
          size="md:text-[10em]"
          tilt={2}
        />

        <FadeIn delay={0.2} fullWidth>
          <section className="relative mt-24 overflow-hidden rounded-[2.5rem] bg-primary px-6 py-24 sm:px-12 text-center shadow-2xl">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.2),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(0,0,0,0.2),transparent_50%)]" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl opacity-20 pointer-events-none">
              <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white rounded-full blur-[100px]" />
              <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-black rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-3xl mx-auto space-y-8">
              <div className="space-y-6">
                <h2 className="text-4xl font-bold tracking-tight text-primary-foreground sm:text-5xl">
                  Ready to automate your sprint planning?
                </h2>
                <p className="text-lg text-primary-foreground/80 leading-relaxed max-w-2xl mx-auto">
                  Join teams saving 10+ hours per sprint with ClearSprint AI.
                  Experience the power of automated ticket generation today.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button
                  asChild
                  size="lg"
                  className="bg-background text-foreground shadow-xl hover:bg-background/90 hover:scale-105 text-base font-semibold px-8 h-14 transition-all duration-300"
                >
                  <Link href="/auth/signin">Start Free Trial</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 hover:text-white hover:scale-105 text-base font-semibold px-8 h-14 backdrop-blur-sm transition-all duration-300"
                >
                  <Link href="#">Schedule a Demo</Link>
                </Button>
              </div>

              <p className="text-sm text-primary-foreground/60 pt-4">
                No credit card required • 14-day free trial • Cancel anytime
              </p>
            </div>
          </section>
        </FadeIn>

        <LandingFooter />
      </main>
      <TextHoverEffect text="CLEARSPRINT" />
    </div>
  );
}
