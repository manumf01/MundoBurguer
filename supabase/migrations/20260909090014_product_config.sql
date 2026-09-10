-- ============================================================================
-- Fase 8 · 0014 · Configurador de producto (vista de detalle /carta/:slug)
-- ============================================================================
-- · menu_config_groups gana `selection` (info | single | multiple): cómo se
--   presenta el bloque en el configurador (lista / radio / checkbox).
-- · menu_config_items.delta admite negativos (p. ej. "Sin bebida -1,50 €").
-- · product_config_groups: qué bloques de opciones se aplican a cada producto.
-- · menu_config_meta gana los descuentos automáticos de la categoría "combo"
--   (menús) por quitar patatas / bebida, y qué categoría es la "combo".

-- ── 1) menu_config_groups.selection ──────────────────────────────────────────
alter table public.menu_config_groups
  add column if not exists selection text not null default 'info'
    check (selection in ('info', 'single', 'multiple'));

-- Deduce el valor inicial de los bloques ya existentes:
--   bullets                     -> info
--   priced con un ítem a 0 €    -> single (el de 0 € es el "incluido")
--   priced sin ítem a 0 €       -> multiple
update public.menu_config_groups g
   set selection = case
     when g.style = 'bullets' then 'info'
     when exists (
       select 1 from public.menu_config_items i
        where i.group_id = g.id and i.delta = 0
     ) then 'single'
     else 'multiple'
   end;

-- Nota: `style` ('bullets'/'priced') y `selection` los mantiene coherentes el
-- panel (GroupDialog). No se añade un CHECK que los acople para no romper el
-- alta de bloques con el flujo antiguo mientras se despliega la Fase 8.

-- ── 2) menu_config_items.delta admite negativos ─────────────────────────────
-- El CHECK original (`delta >= 0`) no tiene nombre fijo garantizado: se busca y
-- se elimina cualquier CHECK sobre `delta`, y se recrea con el rango nuevo.
do $$
declare c text;
begin
  for c in
    select conname from pg_constraint
     where conrelid = 'public.menu_config_items'::regclass
       and contype = 'c'
       and pg_get_constraintdef(oid) ilike '%delta%'
  loop
    execute format(
      'alter table public.menu_config_items drop constraint %I', c
    );
  end loop;
end $$;

alter table public.menu_config_items
  add constraint menu_config_items_delta_check
  check (delta >= -9999 and delta <= 9999);

-- ── 3) product_config_groups (producto × bloque de opciones) ────────────────
create table if not exists public.product_config_groups (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  group_id   uuid not null
               references public.menu_config_groups (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (product_id, group_id)
);

create index if not exists product_config_groups_product_idx
  on public.product_config_groups (product_id);

alter table public.product_config_groups enable row level security;
grant select on public.product_config_groups to anon, authenticated;
grant insert, update, delete on public.product_config_groups to authenticated;

drop policy if exists pcg_public_read on public.product_config_groups;
create policy pcg_public_read on public.product_config_groups
  for select to anon, authenticated using (true);

drop policy if exists pcg_staff_write on public.product_config_groups;
create policy pcg_staff_write on public.product_config_groups
  for all to authenticated
  using (public.is_approved_staff())
  with check (public.is_approved_staff());

-- ── 4) Descuentos automáticos de la categoría "combo" (menús) ───────────────
alter table public.menu_config_meta
  add column if not exists no_fries_delta numeric(6, 2) not null default -1.00
    check (no_fries_delta between -9999 and 0),
  add column if not exists no_drink_delta numeric(6, 2) not null default -1.50
    check (no_drink_delta between -9999 and 0),
  -- Slug de la categoría cuyos productos incluyen patatas + bebida y por tanto
  -- muestran los toggles "Sin patatas" / "Sin bebida". '' = ninguna.
  add column if not exists combo_category_slug text not null default 'menus';
