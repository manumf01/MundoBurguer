import type { HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full font-semibold uppercase tracking-wider',
  {
    variants: {
      variant: {
        amber: 'bg-amber/15 text-amber',
        lime: 'bg-lime/15 text-lime',
        cream: 'bg-white/10 text-cream-dim',
        red: 'bg-brand/25 text-cream',
      },
      size: {
        xs: 'px-2 py-0.5 text-[0.65rem]',
        sm: 'px-2.5 py-1 text-xs',
      },
    },
    defaultVariants: { variant: 'amber', size: 'sm' },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <span
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  );
}
