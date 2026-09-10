import { Link } from 'react-router-dom';
import { ArrowRight, Eye } from 'lucide-react';
import { Section, SectionHeading, Button } from '@/components/ui';
import { useMenuData } from '@/features/menu/hooks/useMenuData';

/** El concepto "del mundo": cada menú enlaza a su posición en la Carta. */
export function WorldTour() {
  const { products } = useMenuData();
  const menus = products.filter((p) => p.category === 'menus');

  return (
    <Section id="del-mundo" spacing="sm">
      <SectionHeading
        eyebrow="Una vuelta al mundo"
        title={`${menus.length} menús, un pasaporte de sabores`}
        description="Del Americano al Morileño, cada menú tiene su carácter. Pincha en cualquiera para verlo en la carta."
      />
      <ul className="mx-auto mt-10 flex max-w-4xl flex-wrap justify-center gap-2.5">
        {menus.map((menu) => (
          <li key={menu.id}>
            <Link
              to={`/carta#item-${menu.id}`}
              aria-label={`Ver el ${menu.name} en la carta`}
              className="group inline-flex items-center gap-2 rounded-full border border-hair bg-white/5 py-2 pl-4 pr-3 text-sm text-cream-dim transition-all hover:-translate-y-0.5 hover:border-amber hover:bg-amber/10 hover:text-cream focus-visible:border-amber"
            >
              {menu.name}
              <span
                className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-amber/15 text-amber transition-colors group-hover:bg-amber group-hover:text-bg"
                aria-hidden="true"
              >
                <Eye size={13} />
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-10 flex justify-center">
        <Button asChild variant="outline">
          <Link to="/carta#cat-menus">
            Ver todos los menús
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </Section>
  );
}
