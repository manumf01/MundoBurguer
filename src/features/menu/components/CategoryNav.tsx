import { useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { cn } from '@/lib/cn';
import type { Category } from '../types';

interface CategoryNavProps {
  categories: Category[];
  activeId: string | null;
  onSelect: (id: string) => void;
}

export function CategoryNav({
  categories,
  activeId,
  onSelect,
}: CategoryNavProps) {
  // Carrusel "libre" (sin snap) con arrastrar-para-desplazar en móvil.
  // Se desactiva en ≥ md, donde las pastillas se reparten en varias líneas.
  const [emblaRef, emblaApi] = useEmblaCarousel({
    dragFree: true,
    align: 'start',
    containScroll: 'trimSnaps',
    breakpoints: { '(min-width: 768px)': { active: false } },
  });

  // Mantiene visible la pastilla activa al desplazarse.
  useEffect(() => {
    if (!emblaApi || !activeId) return;
    const index = categories.findIndex((c) => c.id === activeId);
    if (index >= 0) emblaApi.scrollTo(index);
  }, [emblaApi, activeId, categories]);

  return (
    <nav
      aria-label="Categorías de la carta"
      className="sticky top-[calc(var(--spacing-nav)+0.5rem)] z-30 rounded-2xl border border-hair bg-bg/95 shadow-lg shadow-black/30 backdrop-blur-md"
    >
      <div
        ref={emblaRef}
        className="scroll-fade-x cursor-grab overflow-hidden active:cursor-grabbing md:cursor-auto md:overflow-visible"
      >
        <ul className="flex touch-pan-y gap-2 p-2 md:flex-wrap md:justify-center">
          {categories.map((category) => {
            const isActive = category.id === activeId;
            return (
              <li key={category.id} className="shrink-0 md:shrink">
                <button
                  type="button"
                  data-cat={category.id}
                  aria-current={isActive ? 'true' : undefined}
                  onClick={() => onSelect(category.id)}
                  className={cn(
                    'whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold tracking-wide transition-all',
                    isActive
                      ? 'border-transparent bg-amber text-bg'
                      : 'border-hair bg-white/5 text-cream-dim hover:-translate-y-0.5 hover:border-amber hover:bg-amber/10 hover:text-cream focus-visible:border-amber'
                  )}
                >
                  {category.label}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
