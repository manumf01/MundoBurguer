import type { ElementType, HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  interactive?: boolean;
  /** Presente cuando se renderiza como <a> (as="a"). */
  href?: string;
}

export function Card({
  as: Comp = 'div',
  interactive,
  className,
  ...props
}: CardProps) {
  return (
    <Comp
      className={cn(
        'rounded-2xl border border-hair bg-surface/60 bg-linear-to-b from-white/[0.04] to-transparent backdrop-blur-sm',
        interactive &&
          'transition-[transform,border-color] duration-200 hover:-translate-y-1 hover:border-amber/40',
        className
      )}
      {...props}
    />
  );
}
