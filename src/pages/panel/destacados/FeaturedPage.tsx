import { useEffect, useState } from 'react';
import { useBlocker } from 'react-router-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Alert, Card } from '@/components/ui';
import { Select } from '@/components/ui/Select';
import { ProductCard } from '@/features/menu/components';
import {
  ConfirmDialog,
  SortableCard,
  SortableList,
  UnsavedBar,
  adminToProduct,
  reorderFeatured,
  setProductFeatured,
  useAdminMenu,
  type AdminProduct,
} from '@/features/admin';

const MAX_FEATURED = 4;

/** Columnas = nº de tarjetas (hasta 4), para que repartan todo el ancho. */
function gridColsClass(n: number): string {
  if (n >= 4) return 'sm:grid-cols-2 lg:grid-cols-4';
  if (n === 3) return 'sm:grid-cols-2 lg:grid-cols-3';
  if (n === 2) return 'sm:grid-cols-2';
  return 'grid-cols-1';
}

export function FeaturedPage() {
  const { status, error, products, reload } = useAdminMenu();
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [adding, setAdding] = useState('');
  const [replacing, setReplacing] = useState('');
  const [formKey, setFormKey] = useState(0);
  const [toRemove, setToRemove] = useState<AdminProduct | null>(null);
  // Orden en edición: NO se guarda hasta pulsar "Guardar cambios".
  const [draft, setDraft] = useState<string[] | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);

  const featured = products
    .filter((p) => p.isFeatured)
    .sort((a, b) => (a.featuredOrder ?? 0) - (b.featuredOrder ?? 0));
  const serverOrder = featured.map((p) => p.id);
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

  if (status === 'loading') return <p className="text-cream-dim">Cargando…</p>;
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

  const shown: AdminProduct[] = draft
    ? draft
        .map((id) => featured.find((p) => p.id === id))
        .filter((p): p is AdminProduct => Boolean(p))
    : featured;

  const candidates = products
    .filter((p) => p.isPopular && !p.isFeatured)
    .sort((a, b) => a.name.localeCompare(b.name, 'es'));

  const needsReplace = featured.length >= MAX_FEATURED;
  const canSubmit =
    Boolean(adding) && (!needsReplace || Boolean(replacing)) && !busy && !dirty;

  async function run(fn: () => Promise<void>, fail: string) {
    setActionError(null);
    setBusy(true);
    try {
      await fn();
      await reload();
      setAdding('');
      setReplacing('');
      setFormKey((k) => k + 1);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : fail);
    } finally {
      setBusy(false);
    }
  }

  function handleReorder(nextIds: string[]) {
    setActionError(null);
    setDraft(nextIds);
  }

  async function saveOrder() {
    if (!draft) return;
    setActionError(null);
    setSavingOrder(true);
    try {
      await reorderFeatured(draft);
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

  async function submitAdd() {
    const idx = featured.length;
    if (needsReplace) {
      const target = featured.find((p) => p.id === replacing);
      if (!target) return;
      await setProductFeatured(target.id, false, null);
      await setProductFeatured(adding, true, target.featuredOrder ?? idx);
    } else {
      await setProductFeatured(adding, true, idx);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-2xl tracking-wide text-cream">
          Destacados de la portada
        </h2>
        <p className="mt-1 max-w-prose text-sm text-cream-mute">
          Réplica de la sección «Nuestros imprescindibles» de la portada.
          Arrastra las tarjetas para reordenarlas; el nuevo orden no se guarda
          hasta que pulses «Guardar cambios». Solo pueden estar aquí comidas
          populares (sello 🔥) y la portada muestra hasta {MAX_FEATURED}.
        </p>
      </div>

      {actionError ? <Alert tone="error">{actionError}</Alert> : null}

      {shown.length === 0 ? (
        <p className="text-xs text-cream-mute">
          No hay ninguna comida destacada.
        </p>
      ) : (
        <SortableList
          ids={shown.map((p) => p.id)}
          layout="grid"
          onReorder={handleReorder}
        >
          <ul className={cn('grid gap-4', gridColsClass(shown.length))}>
            {shown.map((p) => (
              <SortableCard
                key={p.id}
                id={p.id}
                handleClassName="left-11 top-2"
              >
                <div className="relative h-full">
                  <button
                    type="button"
                    aria-label={`Quitar ${p.name} de destacados`}
                    title="Quitar de destacados"
                    disabled={busy || dirty}
                    onClick={() => setToRemove(p)}
                    className="absolute left-2 top-2 z-20 grid h-8 w-8 place-items-center rounded-lg border border-hair bg-bg/80 text-cream-dim backdrop-blur transition-colors hover:border-brand-light hover:bg-brand/15 hover:text-brand-light disabled:opacity-40"
                  >
                    <X size={15} aria-hidden="true" />
                  </button>
                  <ProductCard product={adminToProduct(p)} className="h-full" />
                </div>
              </SortableCard>
            ))}
          </ul>
        </SortableList>
      )}

      <Card className="flex flex-col gap-4 p-5">
        <div>
          <p className="text-sm font-semibold text-cream">
            {needsReplace ? 'Sustituir una comida' : 'Añadir una comida'}
          </p>
          <p className="mt-1 text-xs text-cream-mute">
            {needsReplace
              ? `Ya hay ${MAX_FEATURED} comidas destacadas. Para meter otra, elige a cuál sustituye.`
              : `Puedes añadir hasta llegar a ${MAX_FEATURED}. Quita alguna de la lista para hacer sitio.`}
            {dirty
              ? ' Guarda o descarta el orden antes de tocar la lista.'
              : ''}
          </p>
        </div>

        {candidates.length === 0 ? (
          <p className="text-xs text-cream-mute">
            No hay comidas populares fuera de la sección. Marca alguna como
            «Popular» en la carta.
          </p>
        ) : (
          <div key={formKey} className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5 text-xs text-cream-mute">
                Comida a añadir (populares fuera de la sección)
                <Select
                  ariaLabel="Comida a añadir"
                  placeholder="— Elige —"
                  disabled={dirty}
                  value={adding}
                  onValueChange={setAdding}
                  options={candidates.map((p) => ({
                    value: p.id,
                    label: p.name,
                  }))}
                />
              </div>
              {needsReplace ? (
                <div className="flex flex-col gap-1.5 text-xs text-cream-mute">
                  ¿A cuál sustituye? (ya en la sección)
                  <Select
                    ariaLabel="Comida a la que sustituye"
                    placeholder="— Elige —"
                    disabled={dirty}
                    value={replacing}
                    onValueChange={setReplacing}
                    options={featured.map((p) => ({
                      value: p.id,
                      label: p.name,
                    }))}
                  />
                </div>
              ) : null}
            </div>
            <div>
              <button
                type="button"
                disabled={!canSubmit}
                onClick={() =>
                  void run(
                    submitAdd,
                    needsReplace
                      ? 'No se pudo sustituir.'
                      : 'No se pudo añadir.'
                  )
                }
                className="h-11 rounded-xl border border-amber bg-amber/15 px-4 text-sm font-semibold text-cream transition-colors hover:bg-amber/25 disabled:opacity-40"
              >
                {needsReplace ? 'Sustituir' : 'Añadir a destacados'}
              </button>
            </div>
          </div>
        )}
      </Card>

      <UnsavedBar
        show={dirty}
        message="El orden de «Nuestros imprescindibles» ha cambiado."
        saving={savingOrder}
        onSave={() => void saveOrder()}
        onDiscard={discardOrder}
      />

      <ConfirmDialog
        open={toRemove !== null}
        onOpenChange={(open) => {
          if (!open) setToRemove(null);
        }}
        title="Quitar de destacados"
        description={
          <>
            ¿Quitar <strong className="text-cream">{toRemove?.name}</strong> de
            «Nuestros imprescindibles»? Seguirá siendo popular, pero dejará de
            salir en la portada.
          </>
        }
        confirmLabel="Quitar"
        busyLabel="Quitando…"
        onConfirm={() => {
          const target = toRemove;
          setToRemove(null);
          if (target) {
            void run(
              () => setProductFeatured(target.id, false, null),
              'No se pudo quitar.'
            );
          }
        }}
        busy={busy}
      />

      <ConfirmDialog
        open={blocker.state === 'blocked'}
        onOpenChange={(open) => {
          if (!open) blocker.reset?.();
        }}
        title="Cambios sin guardar"
        description="Si sales de esta vista perderás los cambios de orden que no hayas guardado. ¿Salir de todos modos?"
        confirmLabel="Salir sin guardar"
        onConfirm={() => blocker.proceed?.()}
      />
    </div>
  );
}
