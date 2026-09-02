import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/cn';
import { site } from '@/config/site';
import { ALLERGENS, ALLERGEN_ORDER } from '@/features/menu/data/allergens';
import { AllergenIcon } from './AllergenIcon';

interface AllergenLegendProps {
  className?: string;
  /** Solo los alérgenos indicados (por defecto, los 14). */
  only?: (typeof ALLERGEN_ORDER)[number][];
}

export function AllergenLegend({ className, only }: AllergenLegendProps) {
  const list = only ?? ALLERGEN_ORDER;

  return (
    <div className={cn('flex flex-col gap-5', className)}>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3 md:grid-cols-4">
        {list.map((id) => (
          <li
            key={id}
            className="flex items-center gap-2 text-sm text-cream-dim"
          >
            <AllergenIcon id={id} />
            <span>{ALLERGENS[id].label}</span>
          </li>
        ))}
      </ul>

      <p className="flex items-start gap-2.5 rounded-xl border border-amber/30 bg-amber/10 p-3.5 text-sm text-cream-dim">
        <AlertTriangle
          size={18}
          className="mt-0.5 shrink-0 text-amber"
          aria-hidden="true"
        />
        <span>
          <strong className="font-semibold text-cream">Atención: </strong>
          {site.allergenNotice}
        </span>
      </p>
    </div>
  );
}
