import type { FormEvent } from 'react';
import { Alert, Button, Toggle } from '@/components/ui';
import { Select } from '@/components/ui/Select';
import { ALLERGENS, ALLERGEN_ORDER } from '@/features/menu/data/allergens';
import type { GarnishId } from '@/features/menu/types';
import {
  Field,
  TagPicker,
  inputClass,
  textareaClass,
  type AdminCategory,
  type FieldErrors,
  type ProductFormValues,
} from '@/features/admin';
import { PricingFields } from './PricingFields';
import { ImageField, type ImageAction } from './ImageField';

const ALLERGEN_OPTIONS = ALLERGEN_ORDER.map((id) => ({
  id,
  label: ALLERGENS[id].label,
}));

const GARNISH_OPTIONS: { id: GarnishId; label: string }[] = [
  { id: 'tomate', label: 'Tomate' },
  { id: 'cebolla', label: 'Cebolla' },
  { id: 'lechuga', label: 'Lechuga' },
];

export function ProductForm({
  values,
  errors,
  categories,
  mode,
  saving,
  serverError,
  currentImageUrl,
  imageAction,
  featuredProducts,
  isCurrentlyFeatured,
  configGroups,
  onChange,
  onNameChange,
  onNameBlur,
  onDescriptionBlur,
  onImageChange,
  onSubmit,
  onCancel,
}: {
  values: ProductFormValues;
  errors: FieldErrors;
  categories: AdminCategory[];
  mode: 'create' | 'edit';
  saving: boolean;
  serverError: string | null;
  currentImageUrl: string | null;
  imageAction: ImageAction;
  featuredProducts: { id: string; name: string }[];
  isCurrentlyFeatured: boolean;
  /** Bloques de "Configura tu Menú" disponibles para asignar. */
  configGroups: { id: string; heading: string; autoCategories: string[] }[];
  onChange: (patch: Partial<ProductFormValues>) => void;
  onNameChange: (name: string) => void;
  onNameBlur: () => void;
  onDescriptionBlur: () => void;
  onImageChange: (action: ImageAction) => void;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const showReplaceSelect =
    values.isPopular && !isCurrentlyFeatured && featuredProducts.length > 0;

  // Bloques que se aplican solos por la categoría elegida (no se desmarcan).
  const selectedSlug =
    categories.find((c) => c.id === values.categoryId)?.slug ?? '';
  const lockedGroupIds = configGroups
    .filter((g) => g.autoCategories.includes(selectedSlug))
    .map((g) => g.id);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Field label="Nombre" htmlFor="name" error={errors.name}>
        <input
          id="name"
          value={values.name}
          onChange={(e) => onNameChange(e.target.value)}
          onBlur={onNameBlur}
          className={inputClass}
          autoComplete="off"
        />
      </Field>

      <Field label="Categoría" htmlFor="category" error={errors.categoryId}>
        <Select
          id="category"
          ariaLabel="Categoría"
          placeholder="— Elige —"
          value={values.categoryId}
          onValueChange={(categoryId) => onChange({ categoryId })}
          options={categories.map((c) => ({ value: c.id, label: c.label }))}
        />
      </Field>

      <Field
        label="Descripción"
        htmlFor="description"
        hint="Opcional. Máximo 500 caracteres."
        error={errors.description}
      >
        <textarea
          id="description"
          rows={3}
          value={values.description}
          onChange={(e) => onChange({ description: e.target.value })}
          onBlur={onDescriptionBlur}
          className={textareaClass}
        />
      </Field>

      <ImageField
        currentUrl={currentImageUrl}
        action={imageAction}
        onChange={onImageChange}
      />

      <PricingFields values={values} errors={errors} onChange={onChange} />

      <Field label="Alérgenos" error={errors.allergens}>
        <TagPicker
          options={ALLERGEN_OPTIONS}
          value={values.allergens}
          onChange={(allergens) => onChange({ allergens })}
        />
      </Field>

      <Field label="Guarnición fresca" error={errors.garnish}>
        <TagPicker
          options={GARNISH_OPTIONS}
          value={values.garnish}
          onChange={(garnish) => onChange({ garnish })}
        />
      </Field>

      <div className="flex flex-col gap-4 rounded-xl border border-hair bg-white/5 p-4">
        <Toggle
          id="isNew"
          label="Novedad (sello «Nuevo»)"
          checked={values.isNew}
          onCheckedChange={(isNew) => onChange({ isNew })}
        />
        <Toggle
          id="isPopular"
          label="Popular (sello 🔥 + «Nuestros imprescindibles»)"
          checked={values.isPopular}
          onCheckedChange={(isPopular) =>
            onChange(
              isPopular ? { isPopular } : { isPopular, replacesFeaturedId: '' }
            )
          }
        />
        <Toggle
          id="visible"
          label="Visible en la carta"
          checked={values.visible}
          onCheckedChange={(visible) => onChange({ visible })}
        />
      </div>

      {values.isPopular ? (
        <div className="rounded-xl border border-amber/25 bg-amber/5 p-4">
          {isCurrentlyFeatured ? (
            <p className="text-xs text-cream-dim">
              Ya está en «Nuestros imprescindibles».
            </p>
          ) : showReplaceSelect ? (
            <Field
              label="¿Sustituir a algún imprescindible? (opcional)"
              htmlFor="replaceFeatured"
              hint="Si lo dejas vacío, se añade sin quitar ninguna."
            >
              <Select
                id="replaceFeatured"
                ariaLabel="Imprescindible al que sustituye"
                placeholder="— Ninguna: solo añadir —"
                value={values.replacesFeaturedId}
                onValueChange={(replacesFeaturedId) =>
                  onChange({ replacesFeaturedId })
                }
                options={featuredProducts.map((p) => ({
                  value: p.id,
                  label: p.name,
                }))}
              />
            </Field>
          ) : (
            <p className="text-xs text-cream-dim">
              Se añadirá a «Nuestros imprescindibles» de la portada.
            </p>
          )}
        </div>
      ) : null}

      {configGroups.length > 0 ? (
        <Field
          label="Personalización (vista de detalle)"
          hint="Bloques de «Configura tu Menú» que verá el cliente en la página de este producto para calcular su precio final. Los marcados en gris se aplican solos por la categoría."
        >
          <TagPicker
            options={configGroups.map((g) => ({ id: g.id, label: g.heading }))}
            value={values.configGroupIds}
            onChange={(configGroupIds) => onChange({ configGroupIds })}
            lockedIds={lockedGroupIds}
          />
        </Field>
      ) : null}

      {serverError ? <Alert tone="error">{serverError}</Alert> : null}

      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>
          {saving
            ? 'Guardando…'
            : mode === 'create'
              ? 'Crear comida'
              : 'Guardar cambios'}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
