import { cn } from '@/lib/cn';
import { Card, NewSeal } from '@/components/ui';
import { AllergenRow } from '@/components/common';
import type { Product } from '../types';
import { ProductPrice } from './ProductPrice';
import { GarnishRow } from './GarnishRow';

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
        'relative flex flex-col',
        hasImage ? 'gap-0' : 'gap-3 p-5',
        className
      )}
    >
      {product.isNew ? (
        <NewSeal className="absolute -right-3 -top-3.5 z-20 w-14 rotate-6" />
      ) : null}

      {hasImage ? (
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-t-2xl bg-bg">
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

        <div className="mt-auto flex flex-col gap-3 pt-1">
          <ProductPrice product={product} />
          {(product.garnish && product.garnish.length > 0) ||
          product.allergens.length > 0 ? (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <GarnishRow garnish={product.garnish ?? []} />
              <AllergenRow allergens={product.allergens} />
            </div>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
