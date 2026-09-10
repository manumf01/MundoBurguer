import { useMemo, useState } from 'react';
import { cn } from '@/lib/cn';
import { Toggle } from '@/components/ui';
import { formatDelta, formatPrice } from '@/lib/format';
import type { MenuConfigData, Product } from '../types';
import {
  configuratorGroups,
  initSingleSelection,
  isComboProduct,
  priceBreakdown,
} from '../configurator';

interface Props {
  product: Product;
  menuConfig: MenuConfigData;
}

function DeltaTag({ delta }: { delta: number }) {
  return (
    <span
      className={cn(
        'shrink-0 font-display text-sm',
        delta > 0 ? 'text-amber' : delta < 0 ? 'text-brand-light' : 'text-lime'
      )}
    >
      {delta === 0 ? 'incluido' : formatDelta(delta)}
    </span>
  );
}

/**
 * Configurador de la vista de detalle: el cliente elige opciones («Configura tu
 * Menú») y ve el precio final en vivo. Puramente informativo (la web no tiene
 * carrito).
 */
export function ProductConfigurator({ product, menuConfig }: Props) {
  const groups = useMemo(
    () => configuratorGroups(product, menuConfig),
    [product, menuConfig]
  );

  const variants = product.variants ?? [];
  const tiers = product.tiers ?? [];
  const isCombo = isComboProduct(product, menuConfig);

  const [baseIdx, setBaseIdx] = useState(0);
  const [single, setSingle] = useState<Record<string, number>>(() =>
    initSingleSelection(groups)
  );
  const [multi, setMulti] = useState<Record<string, number[]>>({});
  const [noFries, setNoFries] = useState(false);
  const [noDrink, setNoDrink] = useState(false);

  const { basePrice, lines, total } = priceBreakdown(
    product,
    menuConfig,
    groups,
    { baseIdx, single, multi, noFries, noDrink }
  );
  const dirty = lines.length > 0 || baseIdx !== 0 || noFries || noDrink;

  function reset() {
    setBaseIdx(0);
    setSingle(initSingleSelection(groups));
    setMulti({});
    setNoFries(false);
    setNoDrink(false);
  }

  const toggleMulti = (key: string, idx: number) =>
    setMulti((m) => {
      const cur = m[key] ?? [];
      return {
        ...m,
        [key]: cur.includes(idx) ? cur.filter((i) => i !== idx) : [...cur, idx],
      };
    });

  return (
    <section
      aria-label="Configura tu pedido"
      className="flex flex-col gap-6 rounded-2xl border border-amber/25 bg-linear-to-b from-brand/15 to-transparent p-5 sm:p-6"
    >
      <div>
        <h2 className="text-heat text-xl sm:text-2xl">
          Configúralo a tu gusto
        </h2>
        <p className="mt-1 text-sm text-cream-dim">
          Elige las opciones y verás el precio final. Es orientativo; el pedido
          se hace en el local.
        </p>
      </div>

      {/* Tamaño / formato (variantes o tramos) */}
      {variants.length > 0 || tiers.length > 0 ? (
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-sm uppercase tracking-widest text-cream-mute">
            {variants.length > 0 ? 'Elige el tamaño' : 'Elige la cantidad'}
          </legend>
          {(variants.length > 0
            ? variants.map((v, i) => ({
                label: v.label,
                price: v.price,
                i,
              }))
            : tiers.map((t, i) => ({
                label: `${t.pieces} uds`,
                price: t.price,
                i,
              }))
          ).map((opt) => (
            <label
              key={opt.i}
              className={cn(
                'flex cursor-pointer items-center justify-between gap-3 rounded-xl border p-3 transition-colors',
                baseIdx === opt.i
                  ? 'border-amber bg-amber/10'
                  : 'border-hair bg-white/5 hover:border-amber/40'
              )}
            >
              <span className="flex items-center gap-3">
                <input
                  type="radio"
                  name="cfg-base"
                  checked={baseIdx === opt.i}
                  onChange={() => setBaseIdx(opt.i)}
                  className="h-4 w-4 accent-amber"
                />
                <span className="font-semibold text-cream">{opt.label}</span>
              </span>
              <span className="font-display text-sm text-amber">
                {formatPrice(opt.price)}
              </span>
            </label>
          ))}
        </fieldset>
      ) : null}

      {groups.map((g) => {
        if (g.selection === 'info') {
          return (
            <div key={g.key}>
              <p className="mb-2 text-sm uppercase tracking-widest text-cream-mute">
                {g.heading}
              </p>
              <ul className="flex flex-col gap-1.5">
                {g.items.map((it, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 text-cream-dim"
                  >
                    <span
                      className="h-1.5 w-1.5 shrink-0 rounded-full bg-lime"
                      aria-hidden="true"
                    />
                    {it.title}
                    {it.detail ? (
                      <span className="text-cream-mute"> — {it.detail}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          );
        }

        const isSingle = g.selection === 'single';
        return (
          <fieldset key={g.key} className="flex flex-col gap-2">
            <legend className="mb-1 text-sm uppercase tracking-widest text-cream-mute">
              {g.heading}
            </legend>
            {g.items.map((it, idx) => {
              const checked = isSingle
                ? (single[g.key] ?? 0) === idx
                : (multi[g.key] ?? []).includes(idx);
              return (
                <label
                  key={idx}
                  className={cn(
                    'flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors',
                    checked
                      ? 'border-amber bg-amber/10'
                      : 'border-hair bg-white/5 hover:border-amber/40'
                  )}
                >
                  <input
                    type={isSingle ? 'radio' : 'checkbox'}
                    name={isSingle ? `cfg-${g.key}` : undefined}
                    checked={checked}
                    onChange={() =>
                      isSingle
                        ? setSingle((s) => ({ ...s, [g.key]: idx }))
                        : toggleMulti(g.key, idx)
                    }
                    className="mt-0.5 h-4 w-4 accent-amber"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="font-semibold text-cream">
                        {it.title}
                      </span>
                      <DeltaTag delta={it.delta} />
                    </span>
                    {it.detail ? (
                      <span className="mt-0.5 block text-xs text-cream-mute">
                        {it.detail}
                      </span>
                    ) : null}
                  </span>
                </label>
              );
            })}
          </fieldset>
        );
      })}

      {isCombo ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm uppercase tracking-widest text-cream-mute">
            Quita lo que no quieras
          </p>
          <div className="flex items-center justify-between gap-3 rounded-xl border border-hair bg-white/5 p-3">
            <Toggle
              checked={noFries}
              onCheckedChange={setNoFries}
              label="Sin patatas"
            />
            <DeltaTag delta={menuConfig.noFriesDelta} />
          </div>
          <div className="flex items-center justify-between gap-3 rounded-xl border border-hair bg-white/5 p-3">
            <Toggle
              checked={noDrink}
              onCheckedChange={setNoDrink}
              label="Sin bebida"
            />
            <DeltaTag delta={menuConfig.noDrinkDelta} />
          </div>
        </div>
      ) : null}

      {/* Desglose */}
      <dl className="flex flex-col gap-1 rounded-xl border border-hair bg-black/20 p-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-cream-mute">Precio base</dt>
          <dd className="text-cream">{formatPrice(basePrice)}</dd>
        </div>
        {lines.map((l, i) => (
          <div key={i} className="flex justify-between">
            <dt className="text-cream-mute">{l.label}</dt>
            <dd className={l.delta < 0 ? 'text-brand-light' : 'text-amber'}>
              {formatDelta(l.delta)}
            </dd>
          </div>
        ))}
      </dl>

      <div className="sticky bottom-4 z-20">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-amber bg-bg-elevated px-5 py-4 shadow-2xl shadow-black/60 ring-4 ring-amber/15">
          <div>
            <p className="text-xs uppercase tracking-widest text-cream-mute">
              Precio final
            </p>
            <p className="font-display text-3xl text-amber">
              {formatPrice(total)}
            </p>
          </div>
          {dirty ? (
            <button
              type="button"
              onClick={reset}
              className="text-sm text-cream-mute underline underline-offset-4 transition-colors hover:text-cream-dim"
            >
              Reiniciar
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
