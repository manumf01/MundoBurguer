import { Check, Plus } from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatDelta } from '@/lib/format';
import { Card, Eyebrow } from '@/components/ui';
import { AllergenRow } from '@/components/common';
import { menuConfig } from '../data/menuConfig';

function OptionItem({
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
        <span className="block text-sm text-cream-dim">{detail}</span>
      </span>
    </li>
  );
}

export function ConfiguraTuMenu({
  className,
  id,
}: {
  className?: string;
  id?: string;
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

      <div className="mt-6 grid gap-8 md:grid-cols-2">
        <div>
          <h3 className="mb-3 flex items-center gap-2 text-sm uppercase tracking-widest text-cream-mute">
            <Check size={15} className="text-lime" aria-hidden="true" />
            Cada menú incluye
          </h3>
          <ul className="flex flex-col gap-2">
            {menuConfig.includes.map((item) => (
              <li key={item} className="flex items-center gap-2 text-cream-dim">
                <span
                  className="h-1.5 w-1.5 rounded-full bg-lime"
                  aria-hidden="true"
                />
                {item}
              </li>
            ))}
          </ul>

          <h3 className="mb-3 mt-6 flex items-center gap-2 text-sm uppercase tracking-widest text-cream-mute">
            Elige tu carne
          </h3>
          <ul className="flex flex-col gap-3">
            {menuConfig.meatChoices.map((choice) => (
              <OptionItem key={choice.title} {...choice} />
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-3 flex items-center gap-2 text-sm uppercase tracking-widest text-cream-mute">
            <Plus size={15} className="text-amber" aria-hidden="true" />
            Extras y mejoras
          </h3>
          <ul className="flex flex-col gap-3">
            {menuConfig.options.map((option) => (
              <OptionItem key={option.title} {...option} />
            ))}
          </ul>

          <div className="mt-6 rounded-xl border border-hair bg-black/20 p-3">
            <p className="mb-2 text-xs uppercase tracking-widest text-cream-mute">
              Alérgenos de pan y salsas
            </p>
            <AllergenRow allergens={[...menuConfig.optionAllergens]} />
          </div>
        </div>
      </div>
    </Card>
  );
}
