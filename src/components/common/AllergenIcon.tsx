import { cn } from '@/lib/cn';
import { ALLERGENS } from '@/features/menu/data/allergens';
import type { AllergenId } from '@/features/menu/types';
import { IconPopover } from './IconPopover';

interface AllergenIconProps {
  id: AllergenId;
  size?: 'sm' | 'md';
  /** Muestra la etiqueta de texto junto al icono. */
  showLabel?: boolean;
  /** Muestra el nombre en un popover al pasar el ratón / tocar. Por defecto sí
   *  (se desactiva donde el nombre ya está visible, p. ej. la leyenda). */
  withPopover?: boolean;
  className?: string;
}

export function AllergenIcon({
  id,
  size = 'sm',
  showLabel = false,
  withPopover = true,
  className,
}: AllergenIconProps) {
  const meta = ALLERGENS[id];
  const Icon = meta.icon;
  const dim = size === 'sm' ? 14 : 18;
  const popover = withPopover && !showLabel;

  const badge = (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-hair bg-black/25',
        size === 'sm' ? 'p-1' : 'px-2 py-1',
        showLabel && 'pr-2.5',
        className
      )}
      title={popover ? undefined : meta.label}
    >
      <Icon
        size={dim}
        color={meta.color}
        strokeWidth={2.25}
        aria-hidden="true"
      />
      <span
        className={cn(
          'sr-only',
          showLabel && 'not-sr-only text-xs text-cream-dim'
        )}
      >
        {meta.label}
      </span>
    </span>
  );

  return popover ? (
    <IconPopover label={meta.label}>{badge}</IconPopover>
  ) : (
    badge
  );
}

interface AllergenRowProps {
  allergens: AllergenId[];
  className?: string;
}

/** Fila compacta de iconos de alérgenos para las tarjetas de producto. */
export function AllergenRow({ allergens, className }: AllergenRowProps) {
  if (allergens.length === 0) return null;
  return (
    <ul
      className={cn('flex flex-wrap items-center gap-1', className)}
      aria-label={`Alérgenos: ${allergens
        .map((a) => ALLERGENS[a].label)
        .join(', ')}`}
    >
      {allergens.map((a) => (
        <li key={a}>
          <AllergenIcon id={a} />
        </li>
      ))}
    </ul>
  );
}
