import type { ElementType, HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

interface ContainerProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  size?: 'default' | 'narrow';
}

export function Container({
  as: Comp = 'div',
  size = 'default',
  className,
  ...props
}: ContainerProps) {
  return (
    <Comp
      className={cn(
        'mx-auto w-full px-5 sm:px-8',
        size === 'default' ? 'max-w-6xl' : 'max-w-3xl',
        className
      )}
      {...props}
    />
  );
}
