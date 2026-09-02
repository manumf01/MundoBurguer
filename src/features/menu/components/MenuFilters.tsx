import { Search, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { ALLERGENS, ALLERGENS_IN_MENU } from '../data/allergens';
import type { UseMenuResult } from '../hooks/useMenu';

type MenuFiltersProps = Pick<
  UseMenuResult,
  | 'search'
  | 'setSearch'
  | 'excludedAllergens'
  | 'toggleAllergen'
  | 'clearFilters'
  | 'hasActiveFilters'
  | 'totalResults'
>;

export function MenuFilters({
  search,
  setSearch,
  excludedAllergens,
  toggleAllergen,
  clearFilters,
  hasActiveFilters,
  totalResults,
}: MenuFiltersProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <Search
          size={18}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-cream-mute"
          aria-hidden="true"
        />
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Busca un plato, un ingrediente…"
          aria-label="Buscar en la carta"
          className="h-12 w-full rounded-full border border-hair bg-white/5 pl-11 pr-4 text-cream placeholder:text-cream-mute focus-visible:border-amber/60"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs uppercase tracking-widest text-cream-mute">
          Sin:
        </span>
        {ALLERGENS_IN_MENU.map((id) => {
          const excluded = excludedAllergens.has(id);
          return (
            <button
              key={id}
              type="button"
              aria-pressed={excluded}
              onClick={() => toggleAllergen(id)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                excluded
                  ? 'border-amber bg-amber/15 text-amber'
                  : 'border-hair bg-white/5 text-cream-dim hover:text-cream'
              )}
            >
              {ALLERGENS[id].label}
            </button>
          );
        })}
        {hasActiveFilters ? (
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs text-cream-mute hover:text-cream"
          >
            <X size={13} aria-hidden="true" />
            Quitar filtros
          </button>
        ) : null}
      </div>

      <p className="text-sm text-cream-mute" aria-live="polite">
        {totalResults} {totalResults === 1 ? 'plato' : 'platos'}
        {hasActiveFilters ? ' con estos filtros' : ' en la carta'}
      </p>
    </div>
  );
}
