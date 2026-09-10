import { useEffect, useState } from 'react';
import { Link, useBlocker, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Alert, Button } from '@/components/ui';
import { LogoSpinner } from '@/components/common/LogoSpinner';
import {
  ConfirmDialog,
  SortableCard,
  SortableList,
  UnsavedBar,
  reorderProducts,
  setProductFeatured,
  setProductVisible,
  softDeleteProduct,
  useAdminMenu,
  type AdminProduct,
} from '@/features/admin';
import { ProductPreviewCard } from './ProductPreviewCard';
import { CategoryQuickNav } from './CategoryQuickNav';
import { catAnchor } from './anchors';

export function ProductListPage() {
  const { status, error, products, categories, reload } = useAdminMenu();
  const navigate = useNavigate();

  const [toDelete, setToDelete] = useState<AdminProduct | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  // Orden en edición: NO se guarda hasta pulsar "Guardar cambios".
  const [draft, setDraft] = useState<Record<string, string[]>>({});
  const [savingDraft, setSavingDraft] = useState(false);

  const serverSlugs = (categoryId: string) =>
    products.filter((p) => p.categoryId === categoryId).map((p) => p.slug);

  const dirtyCategoryIds = Object.entries(draft)
    .filter(([id, slugs]) => slugs.join(' ') !== serverSlugs(id).join(' '))
    .map(([id]) => id);
  const dirty = dirtyCategoryIds.length > 0;

  // Aviso al salir de la vista con cambios de orden sin guardar.
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

  if (status === 'loading') return <LogoSpinner />;
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

  const itemsFor = (categoryId: string): AdminProduct[] => {
    const base = products.filter((p) => p.categoryId === categoryId);
    const ord = draft[categoryId];
    if (!ord) return base;
    const bySlug = new Map(base.map((p) => [p.slug, p]));
    return ord
      .map((slug) => bySlug.get(slug))
      .filter((p): p is AdminProduct => Boolean(p));
  };

  function handleReorder(categoryId: string, nextSlugs: string[]) {
    setActionError(null);
    setDraft((d) => ({ ...d, [categoryId]: nextSlugs }));
  }

  async function saveDraft() {
    setActionError(null);
    setSavingDraft(true);
    try {
      for (const id of dirtyCategoryIds) {
        const slugs = draft[id];
        if (slugs) await reorderProducts(id, slugs);
      }
      await reload();
      setDraft({});
    } catch (e) {
      setActionError(
        e instanceof Error ? e.message : 'No se pudieron guardar los cambios.'
      );
    } finally {
      setSavingDraft(false);
    }
  }

  function discardDraft() {
    setDraft({});
  }

  async function handleToggleVisible(product: AdminProduct) {
    setActionError(null);
    setBusyId(product.id);
    try {
      await setProductVisible(product.id, !product.visible);
      await reload();
    } catch (e) {
      setActionError(
        e instanceof Error ? e.message : 'No se pudo cambiar la visibilidad.'
      );
    } finally {
      setBusyId(null);
    }
  }

  async function handleConfirmDelete() {
    if (!toDelete) return;
    const target = toDelete;
    setActionError(null);
    setBusyId(target.id);
    try {
      await softDeleteProduct(target.id);
      // Si estaba en "Nuestros imprescindibles", entra otra popular al azar.
      if (target.isFeatured) {
        const pool = products.filter(
          (p) => p.id !== target.id && p.isPopular && !p.isFeatured
        );
        const pick = pool[Math.floor(Math.random() * pool.length)];
        if (pick) {
          await setProductFeatured(
            pick.id,
            true,
            target.featuredOrder ?? products.filter((p) => p.isFeatured).length
          );
        }
      }
      // Borrar cambia el conjunto: un borrador de orden pendiente ya no encaja.
      setDraft({});
      await reload();
      setToDelete(null);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'No se pudo eliminar.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-2xl tracking-wide text-cream">
          Comidas <span className="text-cream-mute">· {products.length}</span>
        </h2>
        <Button asChild size="sm">
          <Link to="nueva">
            <Plus size={16} aria-hidden="true" />
            Nueva comida
          </Link>
        </Button>
      </div>

      {actionError ? <Alert tone="error">{actionError}</Alert> : null}

      <p className="max-w-prose text-sm text-cream-mute">
        Así se verá la carta pública. Arrastra las tarjetas para reordenarlas;
        el nuevo orden no se guarda hasta que pulses «Guardar cambios».
      </p>

      <CategoryQuickNav categories={categories} />

      {categories.map((category) => {
        const items = itemsFor(category.id);
        return (
          <section
            key={category.id}
            id={catAnchor(category.id)}
            className="scroll-mt-[calc(var(--spacing-nav)+4.5rem)]"
          >
            <h3 className="mb-3 text-sm uppercase tracking-widest text-cream-mute">
              {category.label}{' '}
              <span className="text-cream-mute/60">· {items.length}</span>
            </h3>
            {items.length === 0 ? (
              <p className="text-xs text-cream-mute">Sin comidas todavía.</p>
            ) : (
              <SortableList
                ids={items.map((p) => p.slug)}
                layout="grid"
                onReorder={(next) => handleReorder(category.id, next)}
              >
                <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
                  {items.map((product) => (
                    <SortableCard
                      key={product.slug}
                      id={product.slug}
                      handleClassName="left-2 top-2"
                    >
                      <ProductPreviewCard
                        product={product}
                        busy={busyId === product.id}
                        onEdit={() => navigate(product.slug)}
                        onToggleVisible={() =>
                          void handleToggleVisible(product)
                        }
                        onDelete={() => setToDelete(product)}
                      />
                    </SortableCard>
                  ))}
                </ul>
              </SortableList>
            )}
          </section>
        );
      })}

      <UnsavedBar
        show={dirty}
        message="El orden de la carta ha cambiado."
        saving={savingDraft}
        onSave={() => void saveDraft()}
        onDiscard={discardDraft}
      />

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(open) => {
          if (!open) setToDelete(null);
        }}
        title="Eliminar comida"
        description={
          <>
            ¿Seguro que quieres eliminar{' '}
            <strong className="text-cream">{toDelete?.name}</strong>? Dejará de
            aparecer en la carta.
          </>
        }
        onConfirm={() => void handleConfirmDelete()}
        busy={busyId === toDelete?.id}
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
