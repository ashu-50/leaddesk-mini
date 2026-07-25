'use client';

import { cn } from '@/lib/utils';
import { useReveal } from '@/hooks/use-reveal';
import type { ReactNode } from 'react';

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Milliseconds of stagger for items in a row. */
  delay?: number;
}

/** Wraps server-rendered content in a scroll-triggered entrance. */
export function Reveal({ children, className, delay = 0 }: RevealProps) {
  const ref = useReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      data-reveal="hidden"
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={cn(className)}
    >
      {children}
    </div>
  );
}
