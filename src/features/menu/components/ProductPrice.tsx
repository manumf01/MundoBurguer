import { formatPrice } from '@/lib/format';
import type { Product } from '../types';

export function ProductPrice({ product }: { product: Product }) {
  if (product.tiers && product.tiers.length > 0) {
    return (
      <dl className="grid grid-cols-4 gap-x-3 gap-y-1 text-sm sm:gap-x-4">
        {product.tiers.map((tier) => (
          <div key={tier.pieces} className="flex flex-col">
            <dt className="text-xs text-cream-mute">{tier.pieces} uds</dt>
            <dd className="font-display text-lg text-amber">
              {formatPrice(tier.price)}
            </dd>
          </div>
        ))}
      </dl>
    );
  }

  if (product.variants && product.variants.length > 0) {
    return (
      <dl className="flex flex-wrap gap-x-5 gap-y-1">
        {product.variants.map((variant) => (
          <div key={variant.label} className="flex flex-col">
            <dt className="text-xs text-cream-mute">{variant.label}</dt>
            <dd className="font-display text-xl text-amber">
              {formatPrice(variant.price)}
            </dd>
          </div>
        ))}
      </dl>
    );
  }

  if (typeof product.price === 'number') {
    return (
      <p className="flex items-baseline gap-2">
        <span className="font-display text-2xl text-amber">
          {formatPrice(product.price)}
        </span>
        {product.priceNote ? (
          <span className="text-xs text-cream-mute">{product.priceNote}</span>
        ) : null}
      </p>
    );
  }

  return null;
}
