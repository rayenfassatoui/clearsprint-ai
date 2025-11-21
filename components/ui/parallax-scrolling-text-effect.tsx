'use client';

import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from 'framer-motion';
import { useRef } from 'react';
import { cn } from '@/lib/utils';

interface VelocityTextProps {
  text?: string;
  className?: string;
  defaultVelocity?: number;
  size: string;
  tilt?: number;
}

export const VelocityText = ({
  text = 'CLEARSPRINT AI • ORCHESTRATE YOUR SPRINTS • SHIP WITH CONFIDENCE • ',
  className,
  defaultVelocity = 5,
  size,
  tilt = 0,
}: VelocityTextProps) => {
  const targetRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ['start end', 'end start'],
  });

  const scrollVelocity = useVelocity(scrollYProgress);

  const skewXRaw = useTransform(
    scrollVelocity,
    [-0.5, 0.5],
    ['45deg', '-45deg'],
  );
  const skewX = useSpring(skewXRaw, { mass: 3, stiffness: 400, damping: 50 });

  const xRaw = useTransform(
    scrollYProgress,
    [-1, 1],
    [0, -1000 * (defaultVelocity / 5)],
  );
  const x = useSpring(xRaw, { mass: 3, stiffness: 400, damping: 50 });

  return (
    <section
      ref={targetRef}
      className={cn('relative w-full text-foreground py-12', className)}
      style={{ transform: `rotate(${tilt}deg)` }}
    >
      <div className="flex items-center">
        <motion.p
          style={{ skewX, x }}
          className={cn(
            'origin-bottom-left whitespace-nowrap font-black uppercase leading-[0.85]  md:leading-[0.85]',
            'text-5xl md:text-7xl',
            size,
          )}
        >
          {text.repeat(4)}
        </motion.p>
      </div>
    </section>
  );
};
