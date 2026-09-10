import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Section, Button, Card, Eyebrow } from '@/components/ui';
import { Reveal } from '@/components/common';
import { formatDelta } from '@/lib/format';
import { useMenuData } from '@/features/menu/hooks/useMenuData';
import type { MenuConfigOption } from '@/features/menu/types';

export function ConfiguraTeaser() {
  const { menuConfig } = useMenuData();
  const highlights: MenuConfigOption[] = (menuConfig.groups ?? [])
    .filter((g) => g.style === 'priced')
    .flatMap((g) => g.items)
    .filter((item) => Boolean(item.title))
    .slice(0, 4);

  return (
    <Section id="configura" spacing="sm">
      <Reveal>
        <Card className="grid gap-8 overflow-hidden border-amber/25 bg-linear-to-br from-brand/30 via-surface/70 to-surface/70 p-8 md:grid-cols-2 md:p-12">
          <div className="flex flex-col justify-center gap-4">
            <Eyebrow>A tu manera</Eyebrow>
            <h2 className="text-heat text-3xl sm:text-4xl">
              {menuConfig.heading}
            </h2>
            <p className="text-cream-dim">
              Cambia las patatas por tu complemento favorito, hazlo XL, súmale
              ingredientes o elige entre ternera, pollo empanado o buey. Cada
              menú incluye siempre patatas fritas y bebida.
            </p>
            <div>
              <Button asChild variant="primary" size="lg">
                <Link to="/carta#configura-titulo">
                  Cómo configurar tu menú
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>

          <ul className="flex flex-col justify-center gap-3">
            {highlights.map((item) => (
              <li
                key={item.title}
                className="flex items-center gap-3 rounded-xl border border-hair bg-black/20 p-3.5"
              >
                <span className="grid h-9 min-w-14 place-items-center rounded-full bg-amber/15 px-2 font-display text-sm text-white">
                  {formatDelta(item.delta)}
                </span>
                <span className="text-sm text-cream-dim">
                  <span className="font-semibold text-cream">
                    {item.title}.{' '}
                  </span>
                  {item.detail}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </Reveal>
    </Section>
  );
}
