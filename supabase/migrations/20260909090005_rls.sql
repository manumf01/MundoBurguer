-- ============================================================================
-- Fase 1 · 0005 · Row Level Security y grants
-- ============================================================================
-- Modelo:
--   · Lectura pública (anon) de la carta: solo lo NO borrado y (productos)
--     visible.
--   · El staff aprobado (admin/editor) lee todo y escribe.
--   · El borrado físico NO se concede a nadie por API: el panel hace
--     soft-delete (deleted_at). Purgar de verdad = SQL / service_role.
--   · profiles: cada quien lee su fila; el admin lee y decide todas.
--   · audit_log: solo lo lee el admin.

alter table public.profiles           enable row level security;
alter table public.categories         enable row level security;
alter table public.products           enable row level security;
alter table public.menu_config_meta   enable row level security;
alter table public.menu_config_items  enable row level security;
alter table public.audit_log          enable row level security;

-- ── Grants a nivel de tabla (RLS filtra las filas encima) ──────────────────
grant select on
  public.categories, public.products,
  public.menu_config_meta, public.menu_config_items
  to anon, authenticated;

grant insert, update on
  public.categories, public.products, public.menu_config_items
  to authenticated;
grant update on public.menu_config_meta to authenticated;

grant select, update on public.profiles to authenticated;
grant select on public.audit_log to authenticated;

-- ── profiles ──────────────────────────────────────────────────────────────
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select to authenticated
  using (id = auth.uid());

drop policy if exists profiles_select_admin on public.profiles;
create policy profiles_select_admin on public.profiles
  for select to authenticated
  using (public.is_admin());

drop policy if exists profiles_update_admin on public.profiles;
create policy profiles_update_admin on public.profiles
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ── categories ────────────────────────────────────────────────────────────
drop policy if exists categories_public_read on public.categories;
create policy categories_public_read on public.categories
  for select to anon, authenticated
  using (deleted_at is null);

drop policy if exists categories_staff_read_all on public.categories;
create policy categories_staff_read_all on public.categories
  for select to authenticated
  using (public.is_approved_staff());

drop policy if exists categories_staff_insert on public.categories;
create policy categories_staff_insert on public.categories
  for insert to authenticated
  with check (public.is_approved_staff());

drop policy if exists categories_staff_update on public.categories;
create policy categories_staff_update on public.categories
  for update to authenticated
  using (public.is_approved_staff())
  with check (public.is_approved_staff());

-- ── products ──────────────────────────────────────────────────────────────
drop policy if exists products_public_read on public.products;
create policy products_public_read on public.products
  for select to anon, authenticated
  using (deleted_at is null and visible = true);

drop policy if exists products_staff_read_all on public.products;
create policy products_staff_read_all on public.products
  for select to authenticated
  using (public.is_approved_staff());

drop policy if exists products_staff_insert on public.products;
create policy products_staff_insert on public.products
  for insert to authenticated
  with check (public.is_approved_staff());

drop policy if exists products_staff_update on public.products;
create policy products_staff_update on public.products
  for update to authenticated
  using (public.is_approved_staff())
  with check (public.is_approved_staff());

-- ── menu_config_meta (fila única) ─────────────────────────────────────────
drop policy if exists menu_meta_public_read on public.menu_config_meta;
create policy menu_meta_public_read on public.menu_config_meta
  for select to anon, authenticated
  using (true);

drop policy if exists menu_meta_staff_update on public.menu_config_meta;
create policy menu_meta_staff_update on public.menu_config_meta
  for update to authenticated
  using (public.is_approved_staff())
  with check (public.is_approved_staff());

-- ── menu_config_items ─────────────────────────────────────────────────────
drop policy if exists menu_items_public_read on public.menu_config_items;
create policy menu_items_public_read on public.menu_config_items
  for select to anon, authenticated
  using (true);

drop policy if exists menu_items_staff_insert on public.menu_config_items;
create policy menu_items_staff_insert on public.menu_config_items
  for insert to authenticated
  with check (public.is_approved_staff());

drop policy if exists menu_items_staff_update on public.menu_config_items;
create policy menu_items_staff_update on public.menu_config_items
  for update to authenticated
  using (public.is_approved_staff())
  with check (public.is_approved_staff());

-- ── audit_log ─────────────────────────────────────────────────────────────
drop policy if exists audit_select_admin on public.audit_log;
create policy audit_select_admin on public.audit_log
  for select to authenticated
  using (public.is_admin());
