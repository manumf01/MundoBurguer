import { useEffect, useRef } from 'react';
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
  const listRef = useRef<HTMLUListElement>(null);

  // Mantiene visible la pastilla activa en el carrusel horizontal (móvil).
  useEffect(() => {
    if (!activeId || !listRef.current) return;
    const el = listRef.current.querySelector<HTMLElement>(
      `[data-cat="${activeId}"]`
    );
    el?.scrollIntoView({ block: 'nearest', inline: 'center' });
  }, [activeId]);

  return (
    <nav
      aria-label="Categorías de la carta"
      className="sticky top-[calc(var(--spacing-nav)+0.5rem)] z-30 rounded-2xl border border-hair bg-bg/95 shadow-lg shadow-black/30 backdrop-blur-md"
    >
      <ul
        ref={listRef}
        className={cn(
          'scroll-fade-x flex gap-2 overflow-x-auto p-2',
          '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          '[scroll-snap-type:x_proximity]',
          'md:flex-wrap md:justify-center md:overflow-visible'
        )}
      >
        {categories.map((category) => {
          const isActive = category.id === activeId;
          return (
            <li key={category.id} className="[scroll-snap-align:center]">
              <button
                type="button"
                data-cat={category.id}
                aria-current={isActive ? 'true' : undefined}
                onClick={() => onSelect(category.id)}
                className={cn(
                  'whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold tracking-wide transition-colors',
                  isActive
                    ? 'bg-amber text-bg'
                    : 'bg-white/5 text-cream-dim hover:bg-white/10 hover:text-cream'
                )}
              >
                {category.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
