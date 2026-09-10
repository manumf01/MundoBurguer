-- ============================================================================
-- Fase 7b · 0013 · "Configura tu Menú" con bloques (grupos) editables
-- ============================================================================
-- Antes los 3 bloques eran fijos (kind = include/option/meat_choice). Ahora son
-- filas en `menu_config_groups`, para poder añadir o quitar bloques.

create table if not exists public.menu_config_groups (
  id         uuid primary key default gen_random_uuid(),
  key        text not null unique
               check (key ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  heading    text not null check (char_length(heading) between 1 and 80),
  -- 'bullets' = lista simple (solo título); 'priced' = título + detalle + coste
  style      text not null default 'priced' check (style in ('bullets', 'priced')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists menu_config_groups_order_idx
  on public.menu_config_groups (sort_order);

drop trigger if exists trg_menu_config_groups_updated_at on public.menu_config_groups;
create trigger trg_menu_config_groups_updated_at
  before update on public.menu_config_groups
  for each row execute function public.set_updated_at();

-- Semilla con los 3 bloques actuales.
insert into public.menu_config_groups (key, heading, style, sort_order) values
  ('incluye', 'Cada menú incluye', 'bullets', 0),
  ('carne', 'Elige tu carne', 'priced', 1),
  ('extras', 'Extras y mejoras', 'priced', 2)
on conflict (key) do nothing;

-- menu_config_items: de `kind` a `group_id`.
alter table public.menu_config_items
  add column if not exists group_id uuid
    references public.menu_config_groups (id) on delete cascade;

update public.menu_config_items i
   set group_id = g.id
  from public.menu_config_groups g
 where i.group_id is null
   and g.key = case i.kind
                 when 'include' then 'incluye'
                 when 'meat_choice' then 'carne'
                 when 'option' then 'extras'
               end;

-- Si quedara algún ítem sin grupo (kind raro), al bloque de extras.
update public.menu_config_items
   set group_id = (select id from public.menu_config_groups where key = 'extras')
 where group_id is null;

alter table public.menu_config_items alter column group_id set not null;
alter table public.menu_config_items drop column if exists kind;

-- ── RLS del nuevo grupo + el DELETE que faltaba en items ──────────────────
alter table public.menu_config_groups enable row level security;
grant select on public.menu_config_groups to anon, authenticated;
grant insert, update, delete on public.menu_config_groups to authenticated;
grant delete on public.menu_config_items to authenticated;

drop policy if exists menu_groups_public_read on public.menu_config_groups;
create policy menu_groups_public_read on public.menu_config_groups
  for select to anon, authenticated using (true);

drop policy if exists menu_groups_staff_write on public.menu_config_groups;
create policy menu_groups_staff_write on public.menu_config_groups
  for all to authenticated
  using (public.is_approved_staff())
  with check (public.is_approved_staff());

drop policy if exists menu_items_staff_delete on public.menu_config_items;
create policy menu_items_staff_delete on public.menu_config_items
  for delete to authenticated using (public.is_approved_staff());

-- Auditoría.
drop trigger if exists trg_audit_menu_groups on public.menu_config_groups;
create trigger trg_audit_menu_groups
  after insert or update or delete on public.menu_config_groups
  for each row execute function public.write_audit('menu_config');
