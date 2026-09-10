import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Alert, Button } from '@/components/ui';
import {
  Field,
  createCategory,
  inputClass,
  slugify,
  updateCategory,
  validateCategory,
  type AdminCategory,
  type CategoryFormValues,
  type FieldErrors,
} from '@/features/admin';

const empty: CategoryFormValues = { slug: '', label: '', tagline: '' };

function toValues(c: AdminCategory): CategoryFormValues {
  return { slug: c.slug, label: c.label, tagline: c.tagline ?? '' };
}

export function CategoryFormDialog({
  open,
  category,
  onOpenChange,
  onSaved,
}: {
  open: boolean;
  /** `undefined` = crear. */
  category?: AdminCategory;
  onOpenChange: (open: boolean) => void;
  onSaved: () => Promise<void>;
}) {
  const mode = category ? 'edit' : 'create';
  const [values, setValues] = useState<CategoryFormValues>(
    category ? toValues(category) : empty
  );
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [seededFor, setSeededFor] = useState(category?.id ?? '__new__');

  const key = category?.id ?? '__new__';
  if (key !== seededFor) {
    setSeededFor(key);
    setValues(category ? toValues(category) : empty);
    setErrors({});
    setServerError(null);
  }

  const set = (patch: Partial<CategoryFormValues>) =>
    setValues((v) => ({ ...v, ...patch }));

  async function handleSubmit() {
    setServerError(null);
    const result = validateCategory(values);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      if (mode === 'create') await createCategory(result.value);
      else await updateCategory(category!.id, result.value);
      await onSaved();
      onOpenChange(false);
    } catch (e) {
      setServerError(
        e instanceof Error ? e.message : 'No se ha podido guardar.'
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <Dialog.Content className="anim-popover fixed left-1/2 top-1/2 z-50 w-[min(30rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-hair bg-bg-elevated p-6 shadow-2xl">
          <Dialog.Title className="font-display text-xl tracking-wide text-cream">
            {mode === 'create'
              ? 'Nueva categoría'
              : `Editar · ${category?.label}`}
          </Dialog.Title>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleSubmit();
            }}
            className="mt-4 flex flex-col gap-4"
          >
            <Field label="Nombre" htmlFor="cat-label" error={errors.label}>
              <input
                id="cat-label"
                value={values.label}
                onChange={(e) =>
                  set({
                    label: e.target.value,
                    slug:
                      mode === 'create' ? slugify(e.target.value) : values.slug,
                  })
                }
                className={inputClass}
                autoComplete="off"
              />
            </Field>

            <Field
              label="Lema"
              htmlFor="cat-tagline"
              hint="Frase corta bajo el título (opcional)."
              error={errors.tagline}
            >
              <input
                id="cat-tagline"
                value={values.tagline}
                onChange={(e) => set({ tagline: e.target.value })}
                className={inputClass}
              />
            </Field>

            {serverError ? <Alert tone="error">{serverError}</Alert> : null}

            <div className="mt-1 flex justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" size="sm" disabled={saving}>
                {saving ? 'Guardando…' : 'Guardar'}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
