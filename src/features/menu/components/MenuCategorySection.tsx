import { Reveal } from '@/components/common';
import { cn } from '@/lib/cn';
import { useGridColumns } from '@/lib/useGridColumns';
import type { MenuCategoryGroup } from '../hooks/useMenu';
import { getRowAwareSlots } from '../utils';
import { ProductCard } from './ProductCard';

interface MenuCategorySectionProps {
  group: MenuCategoryGroup;
  /** id del producto al que se ha llegado desde "Sobre nosotros" (se resalta). */
  highlightId?: string | null;
}

export function MenuCategorySection({
  group,
  highlightId,
}: MenuCategorySectionProps) {
  const { category, products } = group;
  const columns = useGridColumns({ base: 2, sm: 2, lg: 3 });
  const slotsByProduct = getRowAwareSlots(products, columns);

  return (
    <section
      id={`cat-${category.id}`}
      aria-labelledby={`cat-${category.id}-title`}
      className="scroll-mt-36 pt-4"
    >
      <Reveal className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-hair pb-3">
        <h2
          id={`cat-${category.id}-title`}
          className="text-heat text-2xl sm:text-3xl"
        >
          {category.label}
        </h2>
        <p className="font-script text-2xl text-cream-dim">{category.tagline}</p>
      </Reveal>

      <ul className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {products.map((product, i) => (
          <li
            key={product.id}
            id={`item-${product.id}`}
            className="h-full scroll-mt-40"
          >
            <Reveal
              delay={Math.min(i, 8) * 45}
              forceShow={highlightId === product.id}
              className={cn(
                'h-full',
                highlightId === product.id && 'anim-highlight'
              )}
            >
              <ProductCard
                product={product}
                className="h-full"
                slots={slotsByProduct.get(product.id)}
                mobileCompact
              />
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}
