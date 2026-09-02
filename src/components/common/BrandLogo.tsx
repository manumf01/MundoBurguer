import { useId } from 'react';
import { cn } from '@/lib/cn';
import { site } from '@/config/site';

interface BrandLogoProps {
  variant?: 'badge' | 'wordmark';
  className?: string;
}

/**
 * Marca de Mundo Burguer redibujada como vector (la carta solo aporta un
 * logo rasterizado sobre fondo fotográfico). Sustituir por el logo oficial
 * en `src/assets/brand/` cuando esté disponible en vectorial.
 */
export function BrandLogo({ variant = 'badge', className }: BrandLogoProps) {
  const id = useId();
  const arc = `arc-${id}`;

  if (variant === 'wordmark') {
    return (
      <span
        className={cn('inline-flex flex-col leading-none', className)}
        aria-label={site.name}
      >
        <span className="font-script text-lg text-amber lowercase">mundo</span>
        <span className="-mt-1 font-display text-2xl tracking-wide text-cream">
          Burguer
        </span>
      </span>
    );
  }

  return (
    <svg
      viewBox="0 0 200 200"
      role="img"
      aria-label={site.name}
      className={cn('h-12 w-12', className)}
    >
      <circle cx="100" cy="100" r="96" fill="var(--color-orange)" />
      <circle cx="100" cy="100" r="84" fill="var(--color-brand-dark)" />
      <circle
        cx="100"
        cy="100"
        r="84"
        fill="none"
        stroke="var(--color-brand)"
        strokeWidth="6"
      />

      <defs>
        <path id={arc} d="M 32 100 A 68 68 0 0 1 168 100" fill="none" />
      </defs>
      <text
        fill="var(--color-amber-bright)"
        fontFamily="var(--font-script)"
        fontSize="30"
      >
        <textPath href={`#${arc}`} startOffset="50%" textAnchor="middle">
          mundo
        </textPath>
      </text>

      {/* Hamburguesa estilizada */}
      <g transform="translate(100 108)">
        <path d="M -34 -8 A 34 22 0 0 1 34 -8 Z" fill="var(--color-amber)" />
        <circle cx="-14" cy="-16" r="1.6" fill="#fff7e6" />
        <circle cx="2" cy="-20" r="1.6" fill="#fff7e6" />
        <circle cx="16" cy="-15" r="1.6" fill="#fff7e6" />
        <rect x="-34" y="-6" width="68" height="6" rx="3" fill="#e64a2e" />
        <path
          d="M -34 2 q 8 6 17 0 q 9 6 17 0 q 8 6 17 0 q 8 6 17 0 v 3 q -8 5 -17 0 q -9 5 -17 0 q -8 5 -17 0 q -9 5 -17 0 Z"
          fill="var(--color-lime)"
        />
        <path d="M -34 10 A 34 16 0 0 0 34 10 Z" fill="var(--color-amber)" />
      </g>

      <text
        x="100"
        y="176"
        textAnchor="middle"
        fill="var(--color-cream)"
        fontFamily="var(--font-script)"
        fontSize="42"
      >
        Burguer
      </text>
    </svg>
  );
}
