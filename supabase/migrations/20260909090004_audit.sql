-- ============================================================================
-- Fase 1 · 0004 · Registro de auditoría (básico)
-- ============================================================================
-- Quién, cuándo y qué se tocó. Sin snapshot antes/después (ampliable en el
-- futuro). Lo escriben triggers SECURITY DEFINER; solo el admin lo lee.

create table if not exists public.audit_log (
  id           bigint generated always as identity primary key,
  actor_id     uuid,
  actor_email  text,
  action       text not null,
  entity_type  text not null,
  entity_id    text,
  entity_label text,
  created_at   timestamptz not null default now()
);

create index if not exists audit_log_created_idx
  on public.audit_log (created_at desc);

-- ── Auditoría de carta (products / categories / menu_config_*) ─────────────
-- Función genérica: recibe el tipo de entidad como argumento del trigger.
-- NOTA: esta versión la SUSTITUYE 20260909090008_fix_audit_function.sql
-- (accedía a new.deleted_at directo y fallaba en menu_config_*, sin esa
-- columna). No edites este fichero: el arreglo va en 0008.
create or replace function public.write_audit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row    jsonb := case when tg_op = 'DELETE'
                         then to_jsonb(old) else to_jsonb(new) end;
  v_action text;
begin
  if tg_op = 'INSERT' then
    v_action := 'create';
  elsif tg_op = 'DELETE' then
    v_action := 'hard_delete';
  elsif new.deleted_at is not null and old.deleted_at is null then
    v_action := 'delete';
  elsif new.deleted_at is null and old.deleted_at is not null then
    v_action := 'restore';
  else
    v_action := 'update';
  end if;

  insert into public.audit_log (
    actor_id, actor_email, action, entity_type, entity_id, entity_label
  )
  values (
    auth.uid(),
    (select email from public.profiles where id = auth.uid()),
    v_action,
    tg_argv[0],
    coalesce(v_row ->> 'id', v_row ->> 'slug'),
    coalesce(v_row ->> 'name', v_row ->> 'label', v_row ->> 'title',
             v_row ->> 'heading', v_row ->> 'slug')
  );

  return null;
end;
$$;

drop trigger if exists trg_audit_products on public.products;
create trigger trg_audit_products
  after insert or update or delete on public.products
  for each row execute function public.write_audit('product');

drop trigger if exists trg_audit_categories on public.categories;
create trigger trg_audit_categories
  after insert or update or delete on public.categories
  for each row execute function public.write_audit('category');

drop trigger if exists trg_audit_menu_meta on public.menu_config_meta;
create trigger trg_audit_menu_meta
  after update on public.menu_config_meta
  for each row execute function public.write_audit('menu_config');

drop trigger if exists trg_audit_menu_items on public.menu_config_items;
create trigger trg_audit_menu_items
  after insert or update or delete on public.menu_config_items
  for each row execute function public.write_audit('menu_config');

-- ── Auditoría de decisiones de acceso (profiles) ──────────────────────────
create or replace function public.write_profile_audit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status is distinct from old.status
     or new.role is distinct from old.role then
    insert into public.audit_log (
      actor_id, actor_email, action, entity_type, entity_id, entity_label
    )
    values (
      auth.uid(),
      (select email from public.profiles where id = auth.uid()),
      case
        when new.status = 'approved' and old.status <> 'approved' then 'approve'
        when new.status = 'denied' then 'deny'
        when new.role is distinct from old.role then 'role_change'
        else 'update'
      end,
      'profile',
      new.id::text,
      new.email
    );
  end if;
  return null;
end;
$$;

drop trigger if exists trg_audit_profiles on public.profiles;
create trigger trg_audit_profiles
  after update on public.profiles
  for each row execute function public.write_profile_audit();
