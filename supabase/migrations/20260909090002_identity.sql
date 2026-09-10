-- ============================================================================
-- Fase 1 · 0002 · Identidad, roles y solicitudes de acceso
-- ============================================================================

-- ── Correos con acceso preconcedido (bootstrap) ─────────────────────────────
-- Solo se escribe por SQL / service_role. El trigger `handle_new_user` la
-- consulta al crearse una cuenta para decidir si entra ya aprobada.
create table if not exists public.bootstrap_admins (
  email text primary key check (email = lower(email)),
  role  text not null default 'admin' check (role in ('admin', 'editor'))
);

alter table public.bootstrap_admins enable row level security;
revoke all on public.bootstrap_admins from anon, authenticated;

-- ── Perfiles ───────────────────────────────────────────────────────────────
-- Una fila por cuenta de Google que ha intentado entrar alguna vez.
--   status: pending  -> ha solicitado acceso, el admin decide
--           approved -> puede entrar (con rol admin o editor)
--           denied   -> rechazado
create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  email        text not null unique check (email = lower(email)),
  full_name    text,
  avatar_url   text,
  status       text not null default 'pending'
                 check (status in ('pending', 'approved', 'denied')),
  role         text check (role in ('admin', 'editor')),
  requested_at timestamptz not null default now(),
  decided_at   timestamptz,
  decided_by   uuid references public.profiles (id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  -- Un perfil aprobado siempre tiene rol.
  constraint profiles_approved_needs_role
    check (status <> 'approved' or role is not null)
);

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ── Alta de usuario: crea el perfil al registrarse con Google ───────────────
-- Se dispara al insertarse la fila en auth.users. Si el correo está en
-- bootstrap_admins entra aprobado; si no, queda 'pending'.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(new.email);
  v_boot  public.bootstrap_admins%rowtype;
begin
  if v_email is null then
    raise exception 'La cuenta no expone un correo electrónico';
  end if;

  select * into v_boot from public.bootstrap_admins where email = v_email;

  insert into public.profiles (
    id, email, full_name, avatar_url, status, role, decided_at
  )
  values (
    new.id,
    v_email,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name'
    ),
    new.raw_user_meta_data ->> 'avatar_url',
    case when v_boot.email is not null then 'approved' else 'pending' end,
    v_boot.role,
    case when v_boot.email is not null then now() end
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Funciones de autorización (usadas por las políticas RLS) ────────────────
-- SECURITY DEFINER: leen `profiles` saltándose RLS, evitando recursión en las
-- políticas de la propia tabla.
create or replace function public.is_approved_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and status = 'approved'
      and role in ('admin', 'editor')
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and status = 'approved'
      and role = 'admin'
  );
$$;

grant execute on function public.is_approved_staff() to anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;

-- ── Alta idempotente desde la app (respaldo del trigger) ───────────────────
-- El cliente llama a `rpc('ensure_profile')` justo después del login. Si el
-- trigger `on_auth_user_created` no pudo crearse (según permisos de la
-- plataforma sobre auth.users), esto garantiza el perfil igualmente.
create or replace function public.ensure_profile()
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid     uuid := auth.uid();
  v_user    auth.users%rowtype;
  v_boot    public.bootstrap_admins%rowtype;
  v_profile public.profiles%rowtype;
begin
  if v_uid is null then
    raise exception 'No autenticado';
  end if;

  select * into v_profile from public.profiles where id = v_uid;
  if found then
    return v_profile;
  end if;

  select * into v_user from auth.users where id = v_uid;
  select * into v_boot
    from public.bootstrap_admins where email = lower(v_user.email);

  insert into public.profiles (
    id, email, full_name, avatar_url, status, role, decided_at
  )
  values (
    v_uid,
    lower(v_user.email),
    coalesce(
      v_user.raw_user_meta_data ->> 'full_name',
      v_user.raw_user_meta_data ->> 'name'
    ),
    v_user.raw_user_meta_data ->> 'avatar_url',
    case when v_boot.email is not null then 'approved' else 'pending' end,
    v_boot.role,
    case when v_boot.email is not null then now() end
  )
  on conflict (id) do nothing;

  select * into v_profile from public.profiles where id = v_uid;
  return v_profile;
end;
$$;

grant execute on function public.ensure_profile() to authenticated;
