import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Alert, Button, NumberInput } from '@/components/ui';
import {
  Field,
  createMenuConfigItem,
  inputClass,
  textareaClass,
  updateMenuConfigItem,
  validateMenuConfigItem,
  type AdminMenuConfigGroup,
  type AdminMenuConfigItem,
  type FieldErrors,
} from '@/features/admin';

export function MenuItemDialog({
  open,
  group,
  item,
  onOpenChange,
  onSaved,
}: {
  open: boolean;
  group: AdminMenuConfigGroup;
  /** `undefined` = crear. */
  item?: AdminMenuConfigItem;
  onOpenChange: (open: boolean) => void;
  onSaved: () => Promise<void>;
}) {
  const mode = item ? 'edit' : 'create';
  const priced = group.style === 'priced';

  const [title, setTitle] = useState(item?.title ?? '');
  const [detail, setDetail] = useState(item?.detail ?? '');
  const [delta, setDelta] = useState(item ? String(item.delta) : '0');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [seededFor, setSeededFor] = useState(item?.id ?? '__new__');

  const key = item?.id ?? '__new__';
  if (key !== seededFor) {
    setSeededFor(key);
    setTitle(item?.title ?? '');
    setDetail(item?.detail ?? '');
    setDelta(item ? String(item.delta) : '0');
    setErrors({});
    setServerError(null);
  }

  async function handleSubmit() {
    setServerError(null);
    const result = validateMenuConfigItem(group.style, title, detail, delta);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      if (mode === 'create') {
        await createMenuConfigItem({ group_id: group.id, ...result.value });
      } else {
        await updateMenuConfigItem(item!.id, {
          group_id: group.id,
          ...result.value,
        });
      }
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
            {mode === 'create' ? 'Añadir a' : 'Editar en'} «{group.heading}»
          </Dialog.Title>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleSubmit();
            }}
            className="mt-4 flex flex-col gap-4"
          >
            <Field label="Texto" htmlFor="mi-title" error={errors.title}>
              <input
                id="mi-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={inputClass}
                autoComplete="off"
              />
            </Field>

            {priced ? (
              <>
                <Field
                  label="Descripción"
                  htmlFor="mi-detail"
                  hint="Opcional. Máximo 240 caracteres."
                  error={errors.detail}
                >
                  <textarea
                    id="mi-detail"
                    rows={2}
                    value={detail}
                    onChange={(e) => setDetail(e.target.value)}
                    className={textareaClass}
                  />
                </Field>

                <Field
                  label="Importe (€)"
                  htmlFor="mi-delta"
                  hint="Positivo = coste extra · negativo = descuento · 0 = sin cambio."
                  error={errors.delta}
                >
                  <NumberInput
                    id="mi-delta"
                    ariaLabel="Importe en euros"
                    value={delta}
                    onValueChange={setDelta}
                    min={-99}
                    max={9999}
                    decimals={2}
                    allowNegative
                    className="w-44"
                  />
                </Field>
              </>
            ) : null}

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
