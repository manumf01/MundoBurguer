import { useEffect, useState } from 'react';
import { useBlocker } from 'react-router-dom';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatDelta } from '@/lib/format';
import { Alert, Button, Card, NumberInput } from '@/components/ui';
import { Reveal } from '@/components/common';
import { ALLERGENS, ALLERGEN_ORDER } from '@/features/menu/data/allergens';
import {
  ConfirmDialog,
  Field,
  SortableList,
  SortableRow,
  TagPicker,
  UnsavedBar,
  deleteMenuConfigItem,
  deleteMenuGroup,
  inputClass,
  reorderMenuConfigItems,
  reorderMenuGroups,
  updateMenuConfigMeta,
  useAdminMenu,
  type AdminMenuConfigGroup,
  type AdminMenuConfigItem,
} from '@/features/admin';
import type { AllergenId } from '@/features/menu/types';
import { MenuItemDialog } from './MenuItemDialog';
import { GroupDialog } from './GroupDialog';

const ALLERGEN_OPTIONS = ALLERGEN_ORDER.map((id) => ({
  id,
  label: ALLERGENS[id].label,
}));

/** -1 -> "-1,00" para el input controlado. */
const moneyStr = (n: number) => n.toFixed(2).replace('.', ',');
/** "-1,50" -> -1.5, acotado a [-99, 0]; `fallback` si no es un número. */
const parseNeg = (s: string, fallback: number) => {
  const n = Number(s.trim().replace(',', '.'));
  if (!Number.isFinite(n)) return fallback;
  return Math.round(Math.min(0, Math.max(-99, n)) * 100) / 100;
};

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

export function MenuConfigPage() {
  const { status, error, categories, menuConfig, reload } = useAdminMenu();

  const [heading, setHeading] = useState(menuConfig.heading);
  const [allergens, setAllergens] = useState<AllergenId[]>(
    menuConfig.optionAllergens
  );
  const [noFries, setNoFries] = useState(moneyStr(menuConfig.noFriesDelta));
  const [noDrink, setNoDrink] = useState(moneyStr(menuConfig.noDrinkDelta));
  const [savingMeta, setSavingMeta] = useState(false);
  const [metaError, setMetaError] = useState<string | null>(null);
  const [seeded, setSeeded] = useState(false);

  const [groupDialog, setGroupDialog] = useState(false);
  const [editingGroup, setEditingGroup] = useState<
    AdminMenuConfigGroup | undefined
  >();
  const [toDeleteGroup, setToDeleteGroup] =
    useState<AdminMenuConfigGroup | null>(null);
  const [groupBusy, setGroupBusy] = useState(false);
  const [groupError, setGroupError] = useState<string | null>(null);

  // Reordenación diferida: NO se guarda hasta pulsar "Guardar cambios".
  const [groupDraft, setGroupDraft] = useState<string[] | null>(null);
  const [itemDrafts, setItemDrafts] = useState<Record<string, string[]>>({});
  const [savingOrder, setSavingOrder] = useState(false);

  if (!seeded && status === 'ready') {
    setSeeded(true);
    setHeading(menuConfig.heading);
    setAllergens(menuConfig.optionAllergens);
    setNoFries(moneyStr(menuConfig.noFriesDelta));
    setNoDrink(moneyStr(menuConfig.noDrinkDelta));
  }

  const serverGroupOrder = menuConfig.groups.map((g) => g.id);
  const serverItemOrder = (gid: string) =>
    menuConfig.groups.find((g) => g.id === gid)?.items.map((it) => it.id) ?? [];

  const groupsDirty =
    groupDraft != null &&
    groupDraft.join(' ') !== serverGroupOrder.join(' ');
  const dirtyItemGroupIds = Object.entries(itemDrafts)
    .filter(([gid, ids]) => ids.join(' ') !== serverItemOrder(gid).join(' '))
    .map(([gid]) => gid);
  const orderDirty = groupsDirty || dirtyItemGroupIds.length > 0;

  const blocker = useBlocker(orderDirty);

  useEffect(() => {
    if (!orderDirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [orderDirty]);

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

  const friesDelta = parseNeg(noFries, menuConfig.noFriesDelta);
  const drinkDelta = parseNeg(noDrink, menuConfig.noDrinkDelta);
  const metaDirty =
    heading.trim() !== menuConfig.heading ||
    allergens.join(',') !== menuConfig.optionAllergens.join(',') ||
    friesDelta !== menuConfig.noFriesDelta ||
    drinkDelta !== menuConfig.noDrinkDelta;

  async function saveMeta() {
    setMetaError(null);
    setSavingMeta(true);
    try {
      await updateMenuConfigMeta(
        heading.trim().slice(0, 120),
        allergens,
        friesDelta,
        drinkDelta
      );
      await reload();
    } catch (e) {
      setMetaError(e instanceof Error ? e.message : 'No se pudo guardar.');
    } finally {
      setSavingMeta(false);
    }
  }

  const shownGroups = groupDraft
    ? groupDraft
        .map((id) => menuConfig.groups.find((g) => g.id === id))
        .filter((g): g is AdminMenuConfigGroup => Boolean(g))
    : menuConfig.groups;

  async function saveOrder() {
    setGroupError(null);
    setSavingOrder(true);
    try {
      if (groupsDirty && groupDraft) await reorderMenuGroups(groupDraft);
      for (const gid of dirtyItemGroupIds) {
        const ids = itemDrafts[gid];
        if (ids) await reorderMenuConfigItems(ids);
      }
      await reload();
      setGroupDraft(null);
      setItemDrafts({});
    } catch (e) {
      setGroupError(
        e instanceof Error ? e.message : 'No se pudo guardar el orden.'
      );
    } finally {
      setSavingOrder(false);
    }
  }

  function discardOrder() {
    setGroupDraft(null);
    setItemDrafts({});
  }

  // Tras crear/editar/borrar bloques u opciones cambia la estructura, así que
  // un borrador de orden pendiente ya no encaja: se descarta.
  async function resetAndReload() {
    setGroupDraft(null);
    setItemDrafts({});
    await reload();
  }

  async function handleDeleteGroup() {
    if (!toDeleteGroup) return;
    setGroupError(null);
    setGroupBusy(true);
    try {
      await deleteMenuGroup(toDeleteGroup.id);
      await resetAndReload();
      setToDeleteGroup(null);
    } catch (e) {
      setGroupError(e instanceof Error ? e.message : 'No se pudo eliminar.');
    } finally {
      setGroupBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-2xl tracking-wide text-cream">
          Configura tu Menú
        </h2>
        <Button
          size="sm"
          onClick={() => {
            setEditingGroup(undefined);
            setGroupDialog(true);
          }}
        >
          <Plus size={16} aria-hidden="true" />
          Nuevo bloque
        </Button>
      </div>

      <Card className="flex flex-col gap-4 p-5 sm:p-6">
        <Field label="Título del bloque" htmlFor="mc-heading">
          <input
            id="mc-heading"
            value={heading}
            maxLength={120}
            onChange={(e) => setHeading(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field
          label="Alérgenos de pan y salsas"
          hint="Se muestran bajo el bloque de personalización."
        >
          <TagPicker
            options={ALLERGEN_OPTIONS}
            value={allergens}
            onChange={setAllergens}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Descuento por quitar patatas (€)"
            htmlFor="mc-nofries"
            hint="Se resta al precio de los menús. Negativo (p. ej. -1,00)."
          >
            <NumberInput
              id="mc-nofries"
              ariaLabel="Descuento por quitar patatas"
              value={noFries}
              onValueChange={setNoFries}
              min={-99}
              max={0}
              decimals={2}
              allowNegative
              placeholder="-1,00"
              className="w-44"
            />
          </Field>
          <Field
            label="Descuento por quitar bebida (€)"
            htmlFor="mc-nodrink"
            hint="Se resta al precio de los menús. Negativo (p. ej. -1,50)."
          >
            <NumberInput
              id="mc-nodrink"
              ariaLabel="Descuento por quitar bebida"
              value={noDrink}
              onValueChange={setNoDrink}
              min={-99}
              max={0}
              decimals={2}
              allowNegative
              placeholder="-1,50"
              className="w-44"
            />
          </Field>
        </div>

        {metaError ? <Alert tone="error">{metaError}</Alert> : null}
        <div>
          <Button
            size="sm"
            onClick={() => void saveMeta()}
            disabled={savingMeta || !metaDirty}
          >
            {savingMeta ? 'Guardando…' : 'Guardar cabecera'}
          </Button>
        </div>
      </Card>

      {groupError ? <Alert tone="error">{groupError}</Alert> : null}

      <SortableList
        ids={shownGroups.map((g) => g.id)}
        onReorder={(next) => setGroupDraft(next)}
      >
        <ul className="flex flex-col gap-6">
          {shownGroups.map((group) => (
            <SortableRow key={group.id} id={group.id} handle="outside">
              <GroupBlock
                group={group}
                itemOrder={itemDrafts[group.id]}
                onItemReorder={(ids) =>
                  setItemDrafts((d) => ({ ...d, [group.id]: ids }))
                }
                onEdit={() => {
                  setEditingGroup(group);
                  setGroupDialog(true);
                }}
                onDelete={() => setToDeleteGroup(group)}
                onChanged={resetAndReload}
              />
            </SortableRow>
          ))}
        </ul>
      </SortableList>

      <UnsavedBar
        show={orderDirty}
        message="El orden de los bloques o de sus opciones ha cambiado."
        saving={savingOrder}
        onSave={() => void saveOrder()}
        onDiscard={discardOrder}
      />

      <GroupDialog
        open={groupDialog}
        group={editingGroup}
        categories={categories}
        onOpenChange={setGroupDialog}
        onSaved={resetAndReload}
      />

      <ConfirmDialog
        open={toDeleteGroup !== null}
        onOpenChange={(o) => {
          if (!o) setToDeleteGroup(null);
        }}
        title="Eliminar bloque"
        description={
          <>
            ¿Eliminar el bloque{' '}
            <strong className="text-cream">{toDeleteGroup?.heading}</strong> y
            todo lo que contiene?
          </>
        }
        onConfirm={() => void handleDeleteGroup()}
        busy={groupBusy}
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

function GroupBlock({
  group,
  itemOrder,
  onItemReorder,
  onEdit,
  onDelete,
  onChanged,
}: {
  group: AdminMenuConfigGroup;
  itemOrder: string[] | undefined;
  onItemReorder: (ids: string[]) => void;
  onEdit: () => void;
  onDelete: () => void;
  onChanged: () => Promise<void>;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminMenuConfigItem | undefined>();
  const [toDelete, setToDelete] = useState<AdminMenuConfigItem | null>(null);
  const [busy, setBusy] = useState(false);
  const [rowError, setRowError] = useState<string | null>(null);

  const shown = itemOrder
    ? itemOrder
        .map((id) => group.items.find((it) => it.id === id))
        .filter((it): it is AdminMenuConfigItem => Boolean(it))
    : group.items;

  async function handleDelete() {
    if (!toDelete) return;
    setRowError(null);
    setBusy(true);
    try {
      await deleteMenuConfigItem(toDelete.id);
      await onChanged();
      setToDelete(null);
    } catch (e) {
      setRowError(e instanceof Error ? e.message : 'No se pudo eliminar.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-2xl border border-hair bg-white/[0.03] p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-sm uppercase tracking-widest text-cream-mute">
            {group.heading}{' '}
            <span className="text-cream-mute/60">· {group.items.length}</span>
          </h3>
          <p className="text-[11px] text-cream-mute/70">
            {group.selection === 'info'
              ? 'Informativo'
              : group.selection === 'single'
                ? 'Elegir una'
                : 'Elegir varias'}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <IconBtn label="Editar bloque" onClick={onEdit}>
            <Pencil size={15} aria-hidden="true" />
          </IconBtn>
          <IconBtn label="Eliminar bloque" danger onClick={onDelete}>
            <Trash2 size={15} aria-hidden="true" />
          </IconBtn>
        </div>
      </div>

      {rowError ? (
        <Alert tone="error" className="mb-2">
          {rowError}
        </Alert>
      ) : null}

      {shown.length > 0 ? (
        <SortableList ids={shown.map((it) => it.id)} onReorder={onItemReorder}>
          <ul className="flex flex-col gap-2">
            {shown.map((it, i) => (
              <SortableRow key={it.id} id={it.id}>
                <Reveal delay={Math.min(i, 6) * 40} className="min-w-0 flex-1">
                  <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-hair bg-white/5 p-3 transition-[transform,border-color,background-color] duration-200 hover:-translate-y-0.5 hover:border-amber/40 hover:bg-white/[0.07] motion-reduce:transition-none motion-reduce:hover:translate-y-0">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-cream">
                        {it.title}
                      </p>
                      {it.detail ? (
                        <p className="truncate text-xs text-cream-mute">
                          {it.detail}
                        </p>
                      ) : null}
                    </div>
                    {group.style === 'priced' ? (
                      <span
                        className={cn(
                          'shrink-0 rounded-full px-2 py-0.5 font-display text-xs',
                          it.delta > 0
                            ? 'bg-amber/15 text-amber'
                            : it.delta < 0
                              ? 'bg-brand/15 text-brand-light'
                              : 'bg-lime/15 text-lime'
                        )}
                      >
                        {it.delta === 0 ? 'incluido' : formatDelta(it.delta)}
                      </span>
                    ) : null}
                    <div className="flex shrink-0 items-center gap-0.5">
                      <IconBtn
                        label="Editar"
                        onClick={() => {
                          setEditing(it);
                          setDialogOpen(true);
                        }}
                      >
                        <Pencil size={15} aria-hidden="true" />
                      </IconBtn>
                      <IconBtn
                        label="Eliminar"
                        danger
                        onClick={() => setToDelete(it)}
                      >
                        <Trash2 size={15} aria-hidden="true" />
                      </IconBtn>
                    </div>
                  </div>
                </Reveal>
              </SortableRow>
            ))}
          </ul>
        </SortableList>
      ) : (
        <p className="text-xs text-cream-mute">Nada en este bloque todavía.</p>
      )}

      <button
        type="button"
        onClick={() => {
          setEditing(undefined);
          setDialogOpen(true);
        }}
        className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-amber hover:text-amber-bright"
      >
        <Plus size={14} aria-hidden="true" /> Añadir
      </button>

      <MenuItemDialog
        open={dialogOpen}
        group={group}
        item={editing}
        onOpenChange={setDialogOpen}
        onSaved={onChanged}
      />

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(o) => {
          if (!o) setToDelete(null);
        }}
        title="Eliminar"
        description={
          <>
            ¿Eliminar <strong className="text-cream">{toDelete?.title}</strong>?
          </>
        }
        onConfirm={() => void handleDelete()}
        busy={busy}
      />
    </section>
  );
}
