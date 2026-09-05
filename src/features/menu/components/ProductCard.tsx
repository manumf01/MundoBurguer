import { cn } from '@/lib/cn';
import { Card, NewSeal } from '@/components/ui';
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
}

const DEFAULT_SLOTS: ProductCardSlots = {
  showDescription: true,
  showAllergens: true,
};

/**
 * Estructura de altura fija (imagen, título, descripción, precio, alérgenos)
 * para que las tarjetas de un mismo grupo (categoría de la carta, o
 * destacados de Inicio) midan lo mismo y su información se vea alineada
 * entre sí, tenga o no cada producto foto, descripción o alérgenos. Los
 * huecos de descripción y alérgenos solo se reservan si `slots` dice que al
 * menos un producto del grupo los tiene (si ninguno los tiene, no se dejan
 * en blanco).
 */
export function ProductCard({
  product,
  className,
  slots = DEFAULT_SLOTS,
}: ProductCardProps) {
  return (
    <Card
      as="article"
      interactive
      className={cn('relative flex flex-col', className)}
    >
      {product.isNew ? (
        <NewSeal className="absolute -right-3 -top-3.5 z-20 w-14 rotate-6" />
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
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        {/* Altura mínima en rem (no en `lh`, sin soporte fiable aún) que
            reserva exactamente 2 líneas de título, así el resto de la
            tarjeta empieza siempre en el mismo punto tenga el nombre una o
            dos líneas. Si cambias el tamaño/interlineado del título,
            recalcula el valor a juego. */}
        <h3 className="line-clamp-2 min-h-[3.15rem] pr-8 text-left font-display text-xl leading-tight tracking-wide text-cream">
          {product.name}
        </h3>

        {slots.showDescription ? (
          product.description ? (
            <TruncatedText
              text={product.description}
              className="line-clamp-2 min-h-[2.85rem] text-left text-sm leading-relaxed text-cream-dim"
            />
          ) : (
            <p className="min-h-[2.85rem] text-left text-sm text-cream-dim" />
          )
        ) : null}

        <div
          className={cn(
            'flex flex-col gap-3 pt-1',
            // Sin fila de alérgenos, el precio queda como último contenido:
            // le damos el mismo margen hasta el borde inferior de la tarjeta
            // que deja esa fila cuando sí está (su gap-3 + min-h-[3.5rem]),
            // para que no se vea "más pegada" al final que las demás.
            !slots.showAllergens && 'pb-[4.25rem]'
          )}
        >
          <ProductPrice product={product} />
          {slots.showAllergens ? (
            <div className="flex min-h-[3.5rem] flex-wrap content-start items-center gap-x-3 gap-y-1.5">
              <GarnishRow garnish={product.garnish ?? []} />
              <AllergenRow allergens={product.allergens} />
            </div>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
