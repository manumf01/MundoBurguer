import { Check } from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatDelta } from '@/lib/format';
import { Card, Eyebrow } from '@/components/ui';
import { AllergenRow } from '@/components/common';
import type { MenuConfigData, MenuConfigGroup } from '../types';

function PricedItem({
  title,
  detail,
  delta,
}: {
  title: string;
  detail: string;
  delta: number;
}) {
  return (
    <li className="flex items-start gap-3">
      <span
        className={cn(
          'mt-0.5 grid h-7 shrink-0 place-items-center rounded-full px-2 font-display text-sm',
          delta > 0 ? 'bg-amber/15' : 'bg-lime/15 text-lime'
        )}
      >
        {delta > 0 ? (
          formatDelta(delta)
        ) : (
          <Check size={15} aria-hidden="true" />
        )}
      </span>
      <span>
        <span className="font-semibold text-cream">{title}</span>
        {detail ? (
          <span className="block text-sm text-cream-dim">{detail}</span>
        ) : null}
      </span>
    </li>
  );
}

function Group({ group }: { group: MenuConfigGroup }) {
  return (
    <div>
      <h3 className="mb-3 text-sm uppercase tracking-widest text-cream-mute">
        {group.heading}
      </h3>
      {group.style === 'bullets' ? (
        <ul className="flex flex-col gap-2">
          {group.items.map((item) => (
            <li
              key={item.title}
              className="flex items-center gap-2 text-cream-dim"
            >
              <span
                className="h-1.5 w-1.5 rounded-full bg-lime"
                aria-hidden="true"
              />
              {item.title}
            </li>
          ))}
        </ul>
      ) : (
        <ul className="flex flex-col gap-3">
          {group.items.map((item) => (
            <PricedItem key={item.title} {...item} />
          ))}
        </ul>
      )}
    </div>
  );
}

export function ConfiguraTuMenu({
  className,
  id,
  menuConfig,
}: {
  className?: string;
  id?: string;
  menuConfig: MenuConfigData;
}) {
  return (
    <Card
      as="section"
      id={id}
      aria-labelledby="configura-titulo"
      className={cn(
        'scroll-mt-32 overflow-hidden border-amber/25 bg-linear-to-br from-brand/25 via-surface/70 to-surface/70 p-6 sm:p-8',
        className
      )}
    >
      <Eyebrow>Personalízalo</Eyebrow>
      <h2 id="configura-titulo" className="text-heat mt-1 text-2xl sm:text-3xl">
        {menuConfig.heading}
      </h2>

      <div className="mt-6 grid gap-x-8 gap-y-6 md:grid-cols-2">
        {(menuConfig.groups ?? []).map((group) => (
          <Group key={group.key} group={group} />
        ))}

        {(menuConfig.optionAllergens ?? []).length > 0 ? (
          <div className="self-start rounded-xl border border-hair bg-black/20 p-3">
            <p className="mb-2 text-xs uppercase tracking-widest text-cream-mute">
              Alérgenos de pan y salsas
            </p>
            <AllergenRow allergens={[...menuConfig.optionAllergens]} />
          </div>
        ) : null}
      </div>
    </Card>
  );
}
