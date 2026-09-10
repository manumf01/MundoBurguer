import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import type { AdminCategory } from '@/features/admin';
import { catAnchor } from './anchors';

/**
 * Barra de pastillas para saltar a cada categoría sin hacer scroll — mismo
 * método que la navegación de la Carta pública.
 */
export function CategoryQuickNav({
  categories,
}: {
  categories: AdminCategory[];
}) {
  const [activeId, setActiveId] = useState<string | null>(
    categories[0]?.id ?? null
  );
  const clickUntil = useRef(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (Date.now() < clickUntil.current) return;
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        const id = visible[0]?.target.id.replace('panelcat-', '');
        if (id) setActiveId(id);
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );
    for (const c of categories) {
      const el = document.getElementById(catAnchor(c.id));
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [categories]);

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(catAnchor(id));
    if (!el) return;
    clickUntil.current = Date.now() + 800;
    setActiveId(id);
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return (
    <nav
      aria-label="Categorías"
      className="scroll-fade-x no-scrollbar sticky top-[calc(var(--spacing-nav)+0.5rem)] z-30 -mx-1 overflow-x-auto rounded-2xl border border-hair bg-bg/95 px-1 py-2 shadow-lg shadow-black/30 backdrop-blur-md"
    >
      <ul className="flex gap-2 md:flex-wrap">
        {categories.map((c) => {
          const isActive = c.id === activeId;
          return (
            <li key={c.id} className="shrink-0">
              <button
                type="button"
                aria-current={isActive ? 'true' : undefined}
                onClick={() => scrollTo(c.id)}
                className={cn(
                  'whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-semibold tracking-wide transition-all',
                  isActive
                    ? 'border-transparent bg-amber text-bg'
                    : 'border-hair bg-white/5 text-cream-dim hover:border-amber hover:bg-amber/10 hover:text-cream'
                )}
              >
                {c.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
