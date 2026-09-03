import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface EyebrowProps {
  children: ReactNode;
  className?: string;
}

/**
 * Antetítulo de sección: la línea corta en cursiva de marca (Yellowtail) que va
 * encima de los titulares (`text-heat`).
 *
 * ▶ TAMAÑO: se controla SOLO aquí. Cambia `text-3xl` (y si quieres el `sm:…`)
 *   y todos los antetítulos de la web se ajustan a la vez.
 */
export function Eyebrow({ children, className }: EyebrowProps) {
  return (
    <p className={cn('font-script text-3xl text-amber', className)}>
      {children}
    </p>
  );
}
