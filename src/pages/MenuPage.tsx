import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Seo } from '@/lib/seo';
import { Container } from '@/components/ui';
import { useMenu } from '@/features/menu/hooks/useMenu';
import {
  CategoryNav,
  MenuFilters,
  MenuCategorySection,
  ConfiguraTuMenu,
  MenuLegend,
} from '@/features/menu/components';

export function MenuPage() {
  const menu = useMenu();
  const { groups } = menu;
  const { hash } = useLocation();

  // El observer solo escribe aquí (llamada asíncrona); la categoría "efectiva"
  // se deriva en el render para no llamar a setState dentro del efecto.
  const [spyCat, setSpyCat] = useState<string | null>(null);
  const clickScrollUntil = useRef(0);

  // Producto que se resalta al llegar desde "Sobre nosotros" (#item-<id>).
  const [highlightId, setHighlightId] = useState<string | null>(() =>
    hash.startsWith('#item-') ? hash.slice('#item-'.length) : null
  );

  const visibleIds: string[] = groups.map((g) => g.category.id);
  const visibleKey = visibleIds.join('|');
  const activeCat =
    spyCat && visibleIds.includes(spyCat) ? spyCat : (visibleIds[0] ?? null);

  // Scrollspy: marca la categoría visible mientras se hace scroll.
  useEffect(() => {
    const ids = visibleKey ? visibleKey.split('|') : [];
    if (ids.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (Date.now() < clickScrollUntil.current) return;
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        const id = visible[0]?.target.id.replace('cat-', '');
        if (id) setSpyCat(id);
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );

    for (const id of ids) {
      const el = document.getElementById(`cat-${id}`);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [visibleKey]);

  const scrollToCat = useCallback((id: string) => {
    const el = document.getElementById(`cat-${id}`);
    if (!el) return;
    clickScrollUntil.current = Date.now() + 800;
    setSpyCat(id);
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  // Ancla inicial (#cat-menus, #item-menu-americano, #configura-titulo…).
  // Doble rAF: espera a que la maqueta (y el sticky) se asienten.
  useEffect(() => {
    if (!hash) return;
    const isItem = hash.startsWith('#item-');

    let raf = 0;
    raf = requestAnimationFrame(() => {
      raf = requestAnimationFrame(() => {
        setHighlightId(isItem ? hash.slice('#item-'.length) : null);
        const el = document.querySelector(hash);
        if (!el) return;
        clickScrollUntil.current = Date.now() + 1200;
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    // Quita el resalte cuando termina la animación.
    const clear = isItem
      ? window.setTimeout(() => setHighlightId(null), 4200)
      : 0;
    return () => {
      cancelAnimationFrame(raf);
      if (clear) window.clearTimeout(clear);
    };
  }, [hash]);

  return (
    <>
      <Seo
        title="Carta"
        description="La carta completa de Mundo Burguer: menús del mundo, pizzas, complementos, empanadas caseras, patatas, raciones y bebidas. Con información de alérgenos."
        path="/carta"
      />

      <Container className="pt-12">
        <header className="flex flex-col gap-3">
          <p className="font-script text-2xl text-amber">Nuestra carta</p>
          <h1 className="text-heat text-4xl sm:text-5xl">
            Todo lo que cocinamos
          </h1>
          <p className="max-w-2xl text-cream-dim">
            Menús con patatas y bebida incluidas, pizzas de masa artesana,
            empanadas caseras y mucho más. Los iconos indican los alérgenos de
            cada plato.
          </p>
        </header>

        <div className="mt-8">
          <MenuFilters {...menu} />
        </div>
      </Container>

      <Container className="mt-4 pb-24 sm:pb-32">
        <CategoryNav
          categories={groups.map((g) => g.category)}
          activeId={activeCat}
          onSelect={scrollToCat}
        />

        {groups.length > 0 ? (
          <div className="mt-10 flex flex-col gap-16">
            {groups.map((group) => (
              <MenuCategorySection
                key={group.category.id}
                group={group}
                highlightId={highlightId}
              />
            ))}
          </div>
        ) : (
          <p className="mt-16 rounded-2xl border border-hair bg-surface/60 p-10 text-center text-cream-dim">
            No hay platos que coincidan con tu búsqueda. Prueba a quitar algún
            filtro.
          </p>
        )}

        <div className="mt-16 flex flex-col gap-6">
          <ConfiguraTuMenu id="configura" />
          <MenuLegend />
        </div>
      </Container>
    </>
  );
}
