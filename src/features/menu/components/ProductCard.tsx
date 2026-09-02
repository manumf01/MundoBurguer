import { cn } from '@/lib/cn';
import { Card, NewSeal } from '@/components/ui';
import { AllergenRow } from '@/components/common';
import { GARNISHES } from '../data/allergens';
import type { Product } from '../types';
import { ProductPrice } from './ProductPrice';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const hasImage = Boolean(product.image);

  return (
    <Card
      as="article"
      interactive
      className={cn(
        'relative flex flex-col overflow-hidden',
        hasImage ? 'gap-0' : 'gap-3 p-5',
        className
      )}
    >
      {product.isNew ? (
        <NewSeal className="absolute -right-2 -top-3 z-10 w-12 rotate-6" />
      ) : null}

      {hasImage ? (
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-bg">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-surface to-transparent" />
        </div>
      ) : null}

      <div className={cn('flex flex-1 flex-col gap-3', hasImage && 'p-5 pt-4')}>
        <div className="flex items-start justify-between gap-3 pr-8">
          <h3 className="font-display text-xl leading-tight tracking-wide text-cream">
            {product.name}
          </h3>
        </div>

        {product.description ? (
          <p className="text-sm leading-relaxed text-cream-dim">
            {product.description}
          </p>
        ) : null}

        {product.garnish && product.garnish.length > 0 ? (
          <ul
            className="flex flex-wrap gap-1.5"
            aria-label={`Se sirve con ${product.garnish
              .map((g) => GARNISHES[g]?.label.toLowerCase())
              .join(', ')}`}
          >
            {product.garnish.map((g) => (
              <li
                key={g}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2 py-0.5 text-xs text-cream-dim"
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: GARNISHES[g]?.color }}
                  aria-hidden="true"
                />
                {GARNISHES[g]?.label}
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-auto flex flex-col gap-3 pt-1">
          <ProductPrice product={product} />
          <AllergenRow allergens={product.allergens} />
        </div>
      </div>
    </Card>
  );
}
