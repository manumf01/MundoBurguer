import { useEffect, useState } from 'react';
import { useBlocker } from 'react-router-dom';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Alert, Button } from '@/components/ui';
import { Reveal } from '@/components/common';
import {
  ConfirmDialog,
  SortableList,
  SortableRow,
  UnsavedBar,
  reorderCategories,
  softDeleteCategory,
  useAdminMenu,
  type AdminCategory,
} from '@/features/admin';
import { CategoryFormDialog } from './CategoryFormDialog';

export function CategoryListPage() {
  const { status, error, categories, products, reload } = useAdminMenu();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdminCategory | undefined>();
  const [toDelete, setToDelete] = useState<AdminCategory | null>(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  // Orden en edición: NO se guarda hasta pulsar "Guardar cambios".
  const [draft, setDraft] = useState<string[] | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);

  const serverOrder = categories.map((c) => c.slug);
  const dirty = draft != null && draft.join(' ') !== serverOrder.join(' ');

  const blocker = useBlocker(dirty);

  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  if (status === 'loading') {
    return <p className="text-cream-dim">Cargando…</p>;
  }
  if (status === 'error') {
    return (
      <Alert tone="error">
        {error}{' '}
        <button
          type="button"
          onClick={() => void reload()}
          className="underline underline-offset-2"
        >
          Reintentar
        </button>
      </Alert>
    );
  }

  const countByCat = new Map<string, number>();
  for (const p of products) {
    countByCat.set(p.categoryId, (countByCat.get(p.categoryId) ?? 0) + 1);
  }

  const shown: AdminCategory[] = draft
    ? draft
        .map((slug) => categories.find((c) => c.slug === slug))
        .filter((c): c is AdminCategory => Boolean(c))
    : categories;

  function handleReorder(nextSlugs: string[]) {
    setActionError(null);
    setDraft(nextSlugs);
  }

  async function saveOrder() {
    if (!draft) return;
    setActionError(null);
    setSavingOrder(true);
    try {
      await reorderCategories(draft);
      await reload();
      setDraft(null);
    } catch (e) {
      setActionError(
        e instanceof Error ? e.message : 'No se pudo guardar el orden.'
      );
    } finally {
      setSavingOrder(false);
    }
  }

  function discardOrder() {
    setDraft(null);
  }

  // Crear/editar/borrar categorías cambia el conjunto: un borrador de orden
  // pendiente deja de encajar y se descarta.
  async function resetAndReload() {
    setDraft(null);
    await reload();
  }

  async function handleConfirmDelete() {
    if (!toDelete) return;
    setActionError(null);
    setBusy(true);
    try {
      await softDeleteCategory(toDelete.id);
      await resetAndReload();
      setToDelete(null);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'No se pudo eliminar.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-2xl tracking-wide text-cream">
          Categorías{' '}
          <span className="text-cream-mute">· {categories.length}</span>
        </h2>
        <Button
          size="sm"
          onClick={() => {
            setEditing(undefined);
            setFormOpen(true);
          }}
        >
          <Plus size={16} aria-hidden="true" />
          Nueva categoría
        </Button>
      </div>

      {actionError ? <Alert tone="error">{actionError}</Alert> : null}

      <SortableList ids={shown.map((c) => c.slug)} onReorder={handleReorder}>
        <ul className="flex flex-col gap-2">
          {shown.map((category, i) => {
            const n = countByCat.get(category.id) ?? 0;
            return (
              <SortableRow key={category.slug} id={category.slug}>
                <Reveal delay={Math.min(i, 8) * 45} className="min-w-0 flex-1">
                  <div
                    className={cn(
                      'flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-hair bg-white/5 p-3',
                      'transition-[transform,border-color,background-color] duration-200 hover:-translate-y-0.5 hover:border-amber/40 hover:bg-white/[0.07] motion-reduce:transition-none motion-reduce:hover:translate-y-0'
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-cream">
                        {category.label}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-cream-mute">
                        {category.tagline || '—'}
                        {' · '}
                        {n} {n === 1 ? 'comida' : 'comidas'}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
                      <IconBtn
                        label="Editar"
                        onClick={() => {
                          setEditing(category);
                          setFormOpen(true);
                        }}
                      >
                        <Pencil size={15} aria-hidden="true" />
                      </IconBtn>
                      <IconBtn
                        label="Eliminar"
                        danger
                        onClick={() => setToDelete(category)}
                      >
                        <Trash2 size={15} aria-hidden="true" />
                      </IconBtn>
                    </div>
                  </div>
                </Reveal>
              </SortableRow>
            );
          })}
        </ul>
      </SortableList>

      <UnsavedBar
        show={dirty}
        message="El orden de las categorías ha cambiado."
        saving={savingOrder}
        onSave={() => void saveOrder()}
        onDiscard={discardOrder}
      />

      <CategoryFormDialog
        open={formOpen}
        category={editing}
        onOpenChange={setFormOpen}
        onSaved={resetAndReload}
      />

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(o) => {
          if (!o) setToDelete(null);
        }}
        title="Eliminar categoría"
        description={
          <>
            ¿Eliminar <strong className="text-cream">{toDelete?.label}</strong>?
            Solo se puede si no tiene comidas dentro.
          </>
        }
        onConfirm={() => void handleConfirmDelete()}
        busy={busy}
      />

      <ConfirmDialog
        open={blocker.state === 'blocked'}
        onOpenChange={(o) => {
          if (!o) blocker.reset?.();
        }}
        title="Cambios sin guardar"
        description="Si sales de esta vista perderás los cambios de orden que no hayas guardado. ¿Salir de todos modos?"
        confirmLabel="Salir sin guardar"
        onConfirm={() => blocker.proceed?.()}
      />
    </div>
  );
}

function IconBtn({
  label,
  onClick,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        'grid h-8 w-8 place-items-center rounded-lg border border-hair bg-white/5 text-cream-dim transition-[transform,color,background-color,border-color] duration-200 hover:-translate-y-0.5 hover:border-amber/50 hover:bg-amber/10 hover:text-cream active:scale-95 motion-reduce:transition-none motion-reduce:hover:translate-y-0',
        danger &&
          'hover:border-brand-light hover:bg-brand/15 hover:text-brand-light'
      )}
    >
      {children}
    </button>
  );
}
