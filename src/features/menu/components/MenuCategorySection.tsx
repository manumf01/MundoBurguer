import { Reveal } from '@/components/common';
import type { MenuCategoryGroup } from '../hooks/useMenu';
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

      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product, i) => (
          <li
            key={product.id}
            id={`item-${product.id}`}
            className="scroll-mt-40"
          >
            <Reveal
              delay={Math.min(i, 8) * 45}
              forceShow={highlightId === product.id}
              className={
                highlightId === product.id ? 'anim-highlight' : undefined
              }
            >
              <ProductCard product={product} className="h-full" />
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}
