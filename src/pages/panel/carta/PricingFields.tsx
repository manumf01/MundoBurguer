import { Plus, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { NumberInput } from '@/components/ui';
import {
  Field,
  inputClass,
  type FieldErrors,
  type PriceKind,
  type ProductFormValues,
  type TierInput,
  type VariantInput,
} from '@/features/admin';

const KINDS: { id: PriceKind; label: string }[] = [
  { id: 'single', label: 'Precio único' },
  { id: 'variants', label: 'Variantes' },
  { id: 'tiers', label: 'Por piezas' },
];

export function PricingFields({
  values,
  errors,
  onChange,
}: {
  values: ProductFormValues;
  errors: FieldErrors;
  onChange: (patch: Partial<ProductFormValues>) => void;
}) {
  const setVariant = (i: number, patch: Partial<VariantInput>) =>
    onChange({
      variants: values.variants.map((v, idx) =>
        idx === i ? { ...v, ...patch } : v
      ),
    });
  const setTier = (i: number, patch: Partial<TierInput>) =>
    onChange({
      tiers: values.tiers.map((t, idx) => (idx === i ? { ...t, ...patch } : t)),
    });

  return (
    <div className="flex flex-col gap-3">
      <div>
        <span className="block text-sm font-semibold text-cream">Precio</span>
        <div className="mt-1.5 flex flex-wrap gap-2">
          {KINDS.map((k) => (
            <button
              key={k.id}
              type="button"
              aria-pressed={values.priceKind === k.id}
              onClick={() => onChange({ priceKind: k.id })}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
                values.priceKind === k.id
                  ? 'border-amber bg-amber/15 text-cream'
                  : 'border-hair bg-white/5 text-cream-mute hover:text-cream-dim'
              )}
            >
              {k.label}
            </button>
          ))}
        </div>
      </div>

      {values.priceKind === 'single' ? (
        <Field
          label="Importe (€)"
          htmlFor="price"
          hint="Entre 1 y 50. Formato XX,XX."
          error={errors.price}
        >
          <NumberInput
            id="price"
            ariaLabel="Importe en euros"
            value={values.price}
            onValueChange={(price) => onChange({ price })}
            min={1}
            max={50}
            decimals={2}
            placeholder="6,50"
            className="w-44"
          />
        </Field>
      ) : null}

      {values.priceKind === 'variants' ? (
        <div>
          <span className="block text-sm font-semibold text-cream">
            Variantes
          </span>
          {errors.variants ? (
            <p className="mt-1 text-xs text-brand-light">{errors.variants}</p>
          ) : null}
          <ul className="mt-1.5 flex flex-col gap-3">
            {values.variants.map((v, i) => (
              <li key={i} className="flex flex-wrap items-start gap-2">
                <div className="min-w-[9rem] flex-1">
                  <input
                    aria-label={`Nombre de la variante ${i + 1}`}
                    value={v.label}
                    onChange={(e) => setVariant(i, { label: e.target.value })}
                    placeholder="Individual"
                    className={inputClass}
                  />
                  {errors[`variants.${i}.label`] ? (
                    <p className="mt-1 text-xs text-brand-light">
                      {errors[`variants.${i}.label`]}
                    </p>
                  ) : null}
                </div>
                <div>
                  <NumberInput
                    ariaLabel={`Precio de la variante ${i + 1}`}
                    value={v.price}
                    onValueChange={(price) => setVariant(i, { price })}
                    min={1}
                    max={50}
                    decimals={2}
                    placeholder="7,50"
                    className="w-40"
                  />
                  {errors[`variants.${i}.price`] ? (
                    <p className="mt-1 text-xs text-brand-light">
                      {errors[`variants.${i}.price`]}
                    </p>
                  ) : null}
                </div>
                <button
                  type="button"
                  aria-label="Quitar variante"
                  onClick={() =>
                    onChange({
                      variants: values.variants.filter((_, idx) => idx !== i),
                    })
                  }
                  className="mt-2.5 text-cream-mute hover:text-brand-light"
                >
                  <X size={16} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() =>
              onChange({
                variants: [...values.variants, { label: '', price: '' }],
              })
            }
            className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-amber hover:text-amber-bright"
          >
            <Plus size={14} aria-hidden="true" /> Añadir variante
          </button>
        </div>
      ) : null}

      {values.priceKind === 'tiers' ? (
        <div>
          <span className="block text-sm font-semibold text-cream">
            Tramos por piezas
          </span>
          {errors.tiers ? (
            <p className="mt-1 text-xs text-brand-light">{errors.tiers}</p>
          ) : null}
          <ul className="mt-1.5 flex flex-col gap-3">
            {values.tiers.map((t, i) => (
              <li key={i} className="flex flex-wrap items-start gap-2">
                <div>
                  <NumberInput
                    ariaLabel={`Piezas del tramo ${i + 1}`}
                    value={t.pieces}
                    onValueChange={(pieces) => setTier(i, { pieces })}
                    min={1}
                    max={999}
                    decimals={0}
                    placeholder="6"
                    className="w-32"
                  />
                  {errors[`tiers.${i}.pieces`] ? (
                    <p className="mt-1 text-xs text-brand-light">
                      {errors[`tiers.${i}.pieces`]}
                    </p>
                  ) : null}
                </div>
                <span className="mt-3 text-sm text-cream-mute">uds →</span>
                <div>
                  <NumberInput
                    ariaLabel={`Precio del tramo ${i + 1}`}
                    value={t.price}
                    onValueChange={(price) => setTier(i, { price })}
                    min={1}
                    max={50}
                    decimals={2}
                    placeholder="3,00"
                    className="w-40"
                  />
                  {errors[`tiers.${i}.price`] ? (
                    <p className="mt-1 text-xs text-brand-light">
                      {errors[`tiers.${i}.price`]}
                    </p>
                  ) : null}
                </div>
                <button
                  type="button"
                  aria-label="Quitar tramo"
                  onClick={() =>
                    onChange({
                      tiers: values.tiers.filter((_, idx) => idx !== i),
                    })
                  }
                  className="mt-3 text-cream-mute hover:text-brand-light"
                >
                  <X size={16} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() =>
              onChange({
                tiers: [...values.tiers, { pieces: '', price: '' }],
              })
            }
            className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-amber hover:text-amber-bright"
          >
            <Plus size={14} aria-hidden="true" /> Añadir tramo
          </button>
        </div>
      ) : null}

      <Field
        label="Nota junto al precio"
        htmlFor="priceNote"
        hint="Opcional (p. ej. «Gratis con tu Menú»). Máx. 50 caracteres."
        error={errors.priceNote}
      >
        <input
          id="priceNote"
          value={values.priceNote}
          maxLength={50}
          onChange={(e) => onChange({ priceNote: e.target.value.slice(0, 50) })}
          className={inputClass}
        />
      </Field>
    </div>
  );
}
