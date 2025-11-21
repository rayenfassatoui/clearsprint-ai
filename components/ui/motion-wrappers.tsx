'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FadeInProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  fullWidth?: boolean;
}

export const FadeIn = React.forwardRef<HTMLDivElement, FadeInProps>(
  (
    {
      children,
      className,
      delay = 0,
      duration = 0.6,
      direction = 'up',
      fullWidth = false,
      ...props
    },
    ref,
  ) => {
    const variants = {
      hidden: {
        opacity: 0,
        y: direction === 'up' ? 40 : direction === 'down' ? -40 : 0,
        x: direction === 'left' ? 40 : direction === 'right' ? -40 : 0,
        filter: 'blur(8px)',
      },
      visible: {
        opacity: 1,
        y: 0,
        x: 0,
        filter: 'blur(0px)',
        transition: {
          duration,
          delay,
          ease: [0.21, 0.47, 0.32, 0.98] as const,
        },
      },
    };

    return (
      <motion.div
        ref={ref}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        variants={variants}
        className={cn(fullWidth ? 'w-full' : '', className)}
        {...props}
      >
        {children}
      </motion.div>
    );
  },
);
FadeIn.displayName = 'FadeIn';

interface StaggerContainerProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export const StaggerContainer = React.forwardRef<
  HTMLDivElement,
  StaggerContainerProps
>(({ children, className, delay = 0, ...props }, ref) => {
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.15,
            delayChildren: delay,
          },
        },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
});
StaggerContainer.displayName = 'StaggerContainer';

interface FadeInItemProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
}

export const FadeInItem = React.forwardRef<HTMLDivElement, FadeInItemProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        variants={{
          hidden: { opacity: 0, y: 20, filter: 'blur(8px)' },
          visible: {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            transition: {
              type: 'spring',
              stiffness: 100,
              damping: 20,
            },
          },
        }}
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    );
  },
);
FadeInItem.displayName = 'FadeInItem';
