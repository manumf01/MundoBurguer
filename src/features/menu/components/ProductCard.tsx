import { Link } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { Card, NewSeal, PopularSeal } from '@/components/ui';
import { AllergenRow, BrandLogo, TruncatedText } from '@/components/common';
import type { Product } from '../types';
import type { ProductCardSlots } from '../utils';
import { ProductPrice } from './ProductPrice';
import { GarnishRow } from './GarnishRow';

interface ProductCardProps {
  product: Product;
  className?: string;
  /**
   * Qué huecos reservar (descripción, alérgenos/guarnición), decidido para
   * el grupo de tarjetas al que pertenece esta — ver
   * `getProductCardSlots` en `../utils`. Por defecto se reservan ambos.
   */
  slots?: ProductCardSlots;
  /**
   * En móvil, muestra solo imagen + nombre + precio; el resto (descripción,
   * alérgenos, configurador) va en la vista de detalle `/carta/<slug>`.
   */
  mobileCompact?: boolean;
}

const DEFAULT_SLOTS: ProductCardSlots = {
  showDescription: true,
  showAllergens: true,
};

/**
 * Tarjeta de producto. TODA la tarjeta enlaza a la vista de detalle
 * (`/carta/<slug>`) mediante un enlace superpuesto; los tooltips de alérgenos
 * y guarnición van por encima (z-10) y siguen siendo pulsables aparte.
 */
export function ProductCard({
  product,
  className,
  slots = DEFAULT_SLOTS,
  mobileCompact = false,
}: ProductCardProps) {
  const to = `/carta/${product.id}`;

  return (
    <Card
      as="article"
      interactive
      className={cn('group relative flex flex-col', className)}
    >
      {/* Sellos apilados en la esquina superior derecha (algo más pequeños en móvil). */}
      {product.isNew ? (
        <NewSeal className="absolute -right-3 -top-3.5 z-20 w-14 rotate-6 scale-[0.82] sm:scale-100" />
      ) : null}
      {product.isPopular ? (
        <PopularSeal
          className={cn(
            'absolute -right-3 z-20 w-14 rotate-6 scale-[0.82] sm:scale-100',
            product.isNew ? 'top-[2.9rem] sm:top-[3.25rem]' : '-top-3.5'
          )}
        />
      ) : null}

      {/* Enlace que cubre toda la tarjeta (por encima de imagen y textos;
          los tooltips de ingredientes van a z-20 y siguen siendo pulsables). */}
      <Link
        to={to}
        aria-label={`Ver ${product.name}`}
        className="absolute inset-0 z-10 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber/60"
      />

      <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden rounded-t-2xl bg-bg">
        {product.image ? (
          <img
            src={product.image}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="glow-warm flex h-full w-full items-center justify-center bg-surface">
            <BrandLogo decorative className="h-10 w-auto opacity-20" />
          </div>
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-surface to-transparent" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-3 p-5">
        <h3
          className={cn(
            'break-words pr-8 font-display text-xl leading-tight tracking-wide text-cream transition-colors group-hover:text-amber',
            'line-clamp-2',
            mobileCompact ? 'sm:min-h-[3.15rem]' : 'min-h-[3.15rem]'
          )}
        >
          {product.name}
        </h3>

        {slots.showDescription ? (
          <div className={cn(mobileCompact && 'hidden sm:block')}>
            {product.description ? (
              <TruncatedText
                text={product.description}
                className="line-clamp-2 min-h-[2.85rem] break-words text-left text-sm leading-relaxed text-cream-dim"
              />
            ) : (
              <p className="min-h-[2.85rem] text-left text-sm text-cream-dim" />
            )}
          </div>
        ) : null}

        <div
          className={cn(
            'flex flex-col gap-3 pt-1',
            !slots.showAllergens &&
              (mobileCompact ? 'sm:pb-[4.25rem]' : 'pb-[4.25rem]')
          )}
        >
          <ProductPrice product={product} />
          {slots.showAllergens ? (
            <div
              className={cn(
                'relative z-20 flex min-h-[3.5rem] flex-wrap content-start items-center gap-x-3 gap-y-1.5',
                mobileCompact && 'hidden sm:flex'
              )}
            >
              <GarnishRow garnish={product.garnish ?? []} />
              <AllergenRow allergens={product.allergens} />
            </div>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
