import { cn } from '@/lib/cn';
import { site } from '@/config/site';
import logoImg from '@/assets/brand/logo.png';

interface BrandLogoProps {
  variant?: 'badge' | 'wordmark';
  className?: string;
  /** Marca la imagen como decorativa cuando ya hay un nombre visible al lado. */
  decorative?: boolean;
}

/**
 * Marca de Mundo Burguer. El variant "badge" es el logo oficial en
 * `src/assets/brand/logo.webp` (recorte con transparencia de
 * `src/docs/logo-sinfondo.jpg`); "wordmark" es el nombre en texto, para
 * usarlo solo o junto al badge cuando el logo se ve muy pequeño para leerse.
 */
export function BrandLogo({
  variant = 'badge',
  className,
  decorative = false,
}: BrandLogoProps) {
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
    <img
      src={logoImg}
      alt={decorative ? '' : site.name}
      aria-hidden={decorative || undefined}
      width={890}
      height={816}
      className={cn('h-12 w-auto select-none', className)}
    />
  );
}
