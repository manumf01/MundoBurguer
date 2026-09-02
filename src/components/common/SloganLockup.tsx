import { cn } from '@/lib/cn';
import { site } from '@/config/site';
import sloganImg from '@/assets/brand/eslogan.webp';

interface SloganLockupProps {
  className?: string;
  priority?: boolean;
}

/**
 * El eslogan oficial de Mundo Burguer ("El sabor de la auténtica Hamburguesa")
 * con su corona dorada. Pieza de marca destacada — imagen de `src/docs/eslogan.png`.
 */
export function SloganLockup({
  className,
  priority = false,
}: SloganLockupProps) {
  return (
    <img
      src={sloganImg}
      alt={site.slogan}
      width={624}
      height={400}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      className={cn(
        'h-auto w-full max-w-[36rem] select-none drop-shadow-[0_12px_40px_rgba(0,0,0,0.55)]',
        className
      )}
    />
  );
}
