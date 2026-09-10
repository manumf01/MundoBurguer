import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Alert, Button } from '@/components/ui';
import { Select } from '@/components/ui/Select';
import {
  Field,
  TagPicker,
  createMenuGroup,
  inputClass,
  slugify,
  updateMenuGroup,
  validateGroup,
  type AdminCategory,
  type AdminMenuConfigGroup,
  type FieldErrors,
  type GroupFormValues,
} from '@/features/admin';

const empty: GroupFormValues = {
  key: '',
  heading: '',
  selection: 'multiple',
  autoCategories: [],
};

const SELECTION_OPTIONS = [
  { value: 'info', label: 'Informativo (solo lista)' },
  { value: 'single', label: 'Elegir una opción' },
  { value: 'multiple', label: 'Elegir varias' },
];

const toValues = (g: AdminMenuConfigGroup): GroupFormValues => ({
  key: g.key,
  heading: g.heading,
  selection: g.selection,
  autoCategories: [...g.autoCategories],
});

export function GroupDialog({
  open,
  group,
  categories,
  onOpenChange,
  onSaved,
}: {
  open: boolean;
  /** `undefined` = crear. */
  group?: AdminMenuConfigGroup;
  categories: AdminCategory[];
  onOpenChange: (open: boolean) => void;
  onSaved: () => Promise<void>;
}) {
  const mode = group ? 'edit' : 'create';
  const [values, setValues] = useState<GroupFormValues>(
    group ? toValues(group) : empty
  );
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [seededFor, setSeededFor] = useState(group?.id ?? '__new__');

  const k = group?.id ?? '__new__';
  if (k !== seededFor) {
    setSeededFor(k);
    setValues(group ? toValues(group) : empty);
    setErrors({});
    setServerError(null);
  }

  async function handleSubmit() {
    setServerError(null);
    const result = validateGroup(values);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      if (mode === 'create') await createMenuGroup(result.value);
      else
        await updateMenuGroup(group!.id, {
          heading: result.value.heading,
          style: result.value.style,
          selection: result.value.selection,
          auto_categories: result.value.auto_categories,
        });
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
        <Dialog.Content className="anim-popover fixed left-1/2 top-1/2 z-50 max-h-[calc(100vh-2rem)] w-[min(30rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-hair bg-bg-elevated p-6 shadow-2xl">
          <Dialog.Title className="font-display text-xl tracking-wide text-cream">
            {mode === 'create' ? 'Nuevo bloque' : `Editar · ${group?.heading}`}
          </Dialog.Title>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleSubmit();
            }}
            className="mt-4 flex flex-col gap-4"
          >
            <Field
              label="Título del bloque"
              htmlFor="grp-heading"
              error={errors.heading}
            >
              <input
                id="grp-heading"
                value={values.heading}
                onChange={(e) =>
                  setValues((v) => ({
                    ...v,
                    heading: e.target.value,
                    key: mode === 'create' ? slugify(e.target.value) : v.key,
                  }))
                }
                className={inputClass}
                autoComplete="off"
              />
            </Field>

            <Field
              label="Tipo de bloque"
              hint="«Informativo» = solo una lista (p. ej. lo que incluye el menú). «Elegir una» = el cliente escoge una opción (radio). «Elegir varias» = puede marcar varias (checkbox). Las dos últimas llevan descripción y precio por opción."
              error={errors.selection}
            >
              <Select
                ariaLabel="Tipo de bloque"
                value={values.selection}
                onValueChange={(selection) =>
                  setValues((v) => ({
                    ...v,
                    selection: selection as GroupFormValues['selection'],
                  }))
                }
                options={SELECTION_OPTIONS}
              />
            </Field>

            <Field
              label="Automático en estas categorías"
              hint="Los productos de estas categorías aplican el bloque sin marcarlo uno a uno. Déjalo vacío para asignarlo solo desde cada comida."
            >
              <TagPicker
                options={categories.map((c) => ({
                  id: c.slug,
                  label: c.label,
                }))}
                value={values.autoCategories}
                onChange={(autoCategories) =>
                  setValues((v) => ({ ...v, autoCategories }))
                }
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
