'use client';

import { cn } from '@/lib/utils';
import { FadeInItem, StaggerContainer } from './motion-wrappers';
import { Bot, FileText, Layers, RefreshCw, Sparkles, Zap } from 'lucide-react';

export const BentoGrid = ({
  items,
}: {
  items: { title: string; description: string }[];
}) => {
  const icons = [
    RefreshCw, // Multi-Tool Synchronization
    FileText, // PRD to Epics & Tasks
    Layers, // Bulk AI Generation
    Bot, // AI Power Tools
    Zap, // One-Click Sync
    Sparkles, // Smart Context Analysis
  ];

  return (
    <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
      {items.map((item, i) => {
        const Icon = icons[i] || Zap;

        // Layout Logic:
        // Item 0 (First): Large (2 cols)
        // Item 5 (Last): Large (2 cols)
        // Others: Small (1 col)
        const isLarge = i === 0 || i === 5;

        return (
          <FadeInItem
            key={item.title}
            className={cn(
              'group relative overflow-hidden rounded-3xl border border-primary/10 bg-card/50 backdrop-blur-sm p-8 hover:border-primary/30 transition-all duration-500 hover:shadow-lg hover:shadow-primary/5',
              isLarge ? 'lg:col-span-2' : 'lg:col-span-1',
              'min-h-[220px] flex flex-col justify-between',
            )}
          >
            {/* Subtle Primary Gradient Background on Hover */}
            <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Content */}
            <div className="relative z-10 space-y-6">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                <Icon className="h-6 w-6" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>

            {/* Decorative Large Icon for Large Cards */}
            {isLarge && (
              <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500 pointer-events-none">
                <Icon className="h-48 w-48 rotate-12" />
              </div>
            )}
          </FadeInItem>
        );
      })}
    </StaggerContainer>
  );
};
