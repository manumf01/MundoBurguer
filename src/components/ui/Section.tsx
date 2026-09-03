import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Container } from './Container';
import { Eyebrow } from './Eyebrow';

interface SectionProps extends HTMLAttributes<HTMLElement> {
  /** id para el scrollspy / anclas de la carta. */
  id?: string;
  spacing?: 'default' | 'sm' | 'lg';
  containize?: boolean;
}

const spacingMap = {
  sm: 'py-12 sm:py-16',
  default: 'py-16 sm:py-24',
  lg: 'py-20 sm:py-32',
};

export function Section({
  id,
  spacing = 'default',
  containize = true,
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <section id={id} className={cn(spacingMap[spacing], className)} {...props}>
      {containize ? <Container>{children}</Container> : children}
    </section>
  );
}

interface SectionHeadingProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  align?: 'left' | 'center';
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3',
        align === 'center' && 'items-center text-center',
        className
      )}
    >
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h2 className="text-heat text-3xl sm:text-4xl md:text-5xl">{title}</h2>
      {description ? (
        <p className="max-w-2xl text-cream-dim">{description}</p>
      ) : null}
    </div>
  );
}
