'use client';

import { Bot, FileText, RefreshCw, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, useScroll } from 'framer-motion';
import { useRef } from 'react';

export const RoadmapTimeline = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const steps = [
    {
      icon: FileText,
      title: 'Upload & Analyze',
      description:
        'Upload your PRD or project docs. AI instantly extracts requirements, identifies key features, and generates structured Epics & User Stories.',
      step: '01',
    },
    {
      icon: Bot,
      title: 'Refine with AI Chat',
      description:
        'Interact with your project plan. Use the AI assistant to bulk edit tickets, estimate difficulty scores, and refine acceptance criteria in real-time.',
      step: '02',
    },
    {
      icon: RefreshCw,
      title: 'One-Click Sync',
      description:
        'Push your fully planned sprint to Jira, Linear, or other tools with a single click. No manual entry, no copy-pasting.',
      step: '03',
    },
  ];

  return (
    <div ref={containerRef} className="relative py-24 overflow-hidden">
      {/* Section Header */}
      <div className="text-center mb-20 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary mb-4"
        >
          <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse" />
          How It Works
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
        >
          From document to deployed sprint <br className="hidden sm:block" />
          in <span className="text-primary">3 simple steps</span>.
        </motion.h2>
      </div>

      {/* Timeline Container */}
      <div className="relative max-w-5xl mx-auto px-6">
        {/* Central Line (Desktop) */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border hidden md:block -translate-x-1/2">
          <motion.div
            style={{ scaleY: scrollYProgress, transformOrigin: 'top' }}
            className="absolute top-0 left-0 w-full h-full bg-linear-to-b from-primary via-primary to-transparent"
          />
        </div>

        {/* Steps */}
        <div className="space-y-12 md:space-y-24">
          {steps.map((step, index) => {
            const isEven = index % 2 === 0;
            const Icon = step.icon;

            return (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.7, delay: index * 0.2 }}
                className={cn(
                  'relative flex flex-col md:flex-row items-center gap-8 md:gap-16',
                  isEven ? '' : 'md:flex-row-reverse',
                )}
              >
                {/* Timeline Node (Desktop) */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-background border-2 border-primary z-10 hidden md:block shadow-[0_0_0_4px_rgba(var(--background))]">
                  <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20" />
                </div>

                {/* Content Side */}
                <div className="flex-1 w-full md:w-1/2 text-center md:text-left">
                  <div
                    className={cn(
                      'flex flex-col gap-4',
                      isEven
                        ? 'md:items-end md:text-right'
                        : 'md:items-start md:text-left',
                    )}
                  >
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-2 shadow-sm ring-1 ring-primary/20">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed max-w-md">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Visual Side */}
                <div className="flex-1 w-full md:w-1/2">
                  <div
                    className={cn(
                      'relative rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-2 shadow-2xl transition-all hover:scale-[1.02] hover:border-primary/20 group',
                      isEven
                        ? 'bg-linear-to-br from-primary/5 to-transparent'
                        : 'bg-linear-to-bl from-primary/5 to-transparent',
                    )}
                  >
                    <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />

                    {/* Abstract UI Representation */}
                    <div className="relative aspect-video rounded-xl bg-muted/50 overflow-hidden flex items-center justify-center border border-white/5">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--primary),0.1),transparent)]" />

                      {/* Step Number Background */}
                      <span className="absolute text-9xl font-black text-foreground/5 select-none z-0">
                        {step.step}
                      </span>

                      {/* Icon Floating */}
                      <div className="relative z-10 flex flex-col items-center gap-3">
                        <div className="p-4 rounded-2xl bg-background/80 backdrop-blur-md shadow-xl border border-white/10">
                          <Icon className="w-8 h-8 text-primary" />
                        </div>
                        {index < steps.length - 1 && (
                          <ArrowRight className="w-5 h-5 text-muted-foreground/30 rotate-90 md:rotate-0" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
