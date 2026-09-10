import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Section, SectionHeading, Button } from '@/components/ui';
import { Reveal } from '@/components/common';
import { useGridColumns } from '@/lib/useGridColumns';
import { useMenuData } from '@/features/menu/hooks/useMenuData';
import { FEATURED_IDS } from '@/features/menu/data/featured';
import { getRowAwareSlots } from '@/features/menu/utils';
import { ProductCard } from '@/features/menu/components';
import type { Product } from '@/features/menu/types';

export function Destacados() {
  const { products: all } = useMenuData();

  // Preferimos lo que marca la BD (`is_featured`); si no hay nada marcado
  // (BD sin migrar / snapshot antiguo) caemos a la lista estática.
  const flagged = all
    .filter((p) => p.isFeatured)
    .sort((a, b) => (a.featuredOrder ?? 0) - (b.featuredOrder ?? 0));

  const products: Product[] = (
    flagged.length > 0
      ? flagged
      : (() => {
          const byId = new Map(all.map((p) => [p.id, p]));
          return FEATURED_IDS.map((id) => byId.get(id)).filter(
            (p): p is Product => Boolean(p)
          );
        })()
  ).slice(0, 4); // la portada muestra 4 como máximo

  // Si hay menos de 4, las tarjetas reparten todo el ancho (sin huecos).
  const lgCols = Math.min(Math.max(products.length, 1), 4);
  const baseCols = Math.min(Math.max(products.length, 1), 2);
  const columns = useGridColumns({ base: baseCols, sm: 2, lg: lgCols });
  const slotsByProduct = getRowAwareSlots(products, columns);

  // En móvil, 2 por fila (salvo que solo haya 1 destacado).
  const gridColsClass =
    products.length >= 4
      ? 'grid-cols-2 lg:grid-cols-4'
      : products.length === 3
        ? 'grid-cols-2 lg:grid-cols-3'
        : products.length === 2
          ? 'grid-cols-2'
          : 'grid-cols-1';

  return (
    <Section id="destacados">
      <Reveal>
        <SectionHeading
          eyebrow="Los favoritos de la casa"
          title="Nuestros imprescindibles"
          description="Los menús que más piden nuestros clientes, semana tras semana."
        />
      </Reveal>
      <ul className={`mt-12 grid gap-3 sm:gap-4 ${gridColsClass}`}>
        {products.map((product, i) => (
          <li key={product.id} className="h-full">
            <Reveal delay={i * 70} className="h-full">
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
      <Reveal className="mt-10 flex justify-center">
        <Button asChild variant="outline" size="lg">
          <Link to="/carta">
            Ver la carta completa
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </Button>
      </Reveal>
    </Section>
  );
}
