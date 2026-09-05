import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Section, SectionHeading, Button } from '@/components/ui';
import { Reveal } from '@/components/common';
import { useGridColumns } from '@/lib/useGridColumns';
import { getProductsByIds } from '@/features/menu/hooks/useMenu';
import { FEATURED_IDS } from '@/features/menu/data/menu';
import { getRowAwareSlots } from '@/features/menu/utils';
import { ProductCard } from '@/features/menu/components';

export function Destacados() {
  const products = getProductsByIds(FEATURED_IDS);
  const columns = useGridColumns({ base: 1, sm: 2, lg: 4 });
  const slotsByProduct = getRowAwareSlots(products, columns);

  return (
    <Section id="destacados">
      <Reveal>
        <SectionHeading
          eyebrow="Los favoritos de la casa"
          title="Nuestros imprescindibles"
          description="Los menús que más piden nuestros clientes, semana tras semana."
        />
      </Reveal>
      <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product, i) => (
          <li key={product.id} className="h-full">
            <Reveal delay={i * 70} className="h-full">
              <ProductCard
                product={product}
                className="h-full"
                slots={slotsByProduct.get(product.id)}
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
