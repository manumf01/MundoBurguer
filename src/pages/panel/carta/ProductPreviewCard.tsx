import { Eye, EyeOff, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Card, NewSeal, PopularSeal } from '@/components/ui';
import { BrandLogo } from '@/components/common';
import type { AdminProduct } from '@/features/admin';

function IconButton({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'grid h-8 w-8 place-items-center rounded-lg border border-hair bg-white/5 text-cream-dim transition-[transform,color,background-color,border-color] duration-200 hover:-translate-y-0.5 hover:border-amber/50 hover:bg-amber/10 hover:text-cream active:scale-95 disabled:pointer-events-none disabled:opacity-40 motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:h-9 sm:w-9',
        danger &&
          'hover:border-brand-light hover:bg-brand/15 hover:text-brand-light'
      )}
    >
      {children}
    </button>
  );
}

/**
 * Tarjeta de la vista previa de la carta: réplica reducida de `ProductCard`
 * (solo imagen + nombre) con los tres botones de acción del CRUD.
 */
export function ProductPreviewCard({
  product,
  busy,
  onEdit,
  onToggleVisible,
  onDelete,
}: {
  product: AdminProduct;
  busy: boolean;
  onEdit: () => void;
  onToggleVisible: () => void;
  onDelete: () => void;
}) {
  return (
    <Card
      as="article"
      className={cn(
        'relative flex h-full flex-col',
        !product.visible && 'opacity-55'
      )}
    >
      {/* Sellos en la esquina superior derecha (el tirador de reordenar va en
          la izquierda, ver SortableCard). */}
      {product.isNew ? (
        <NewSeal className="absolute -right-3 -top-3.5 z-20 w-12 rotate-6 scale-[0.82] sm:scale-100" />
      ) : null}
      {product.isPopular ? (
        <PopularSeal
          className={cn(
            'absolute -right-3 z-20 w-12 rotate-6 scale-[0.82] sm:scale-100',
            product.isNew ? 'top-[2.4rem] sm:top-[2.75rem]' : '-top-3.5'
          )}
        />
      ) : null}

      <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden rounded-t-2xl bg-bg">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="glow-warm flex h-full w-full items-center justify-center bg-surface">
            <BrandLogo decorative className="h-10 w-auto opacity-20" />
          </div>
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-surface to-transparent" />
        {!product.visible ? (
          <span className="absolute bottom-2 left-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-cream-mute">
            Oculto
          </span>
        ) : null}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2 p-3 sm:gap-3 sm:p-4">
        <h3 className="line-clamp-2 min-h-[2.5rem] break-words font-display text-sm leading-tight tracking-wide text-cream sm:text-base">
          {product.name}
        </h3>
        <div className="mt-auto flex items-center gap-1">
          <IconButton label="Editar" onClick={onEdit}>
            <Pencil size={16} aria-hidden="true" />
          </IconButton>
          <IconButton
            label={product.visible ? 'Ocultar' : 'Mostrar'}
            onClick={onToggleVisible}
            disabled={busy}
          >
            {product.visible ? (
              <Eye size={16} aria-hidden="true" />
            ) : (
              <EyeOff size={16} aria-hidden="true" />
            )}
          </IconButton>
          <IconButton label="Eliminar" onClick={onDelete} danger>
            <Trash2 size={16} aria-hidden="true" />
          </IconButton>
        </div>
      </div>
    </Card>
  );
}
