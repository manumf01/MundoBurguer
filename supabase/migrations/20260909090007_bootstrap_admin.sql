-- ============================================================================
-- Fase 1 · 0007 · Bootstrap del administrador
-- ============================================================================
-- Único correo con acceso preconcedido. El del dueño (rol 'editor') NO se
-- siembra aquí: entra por la vista de solicitudes del panel.
--
-- Para cambiar/añadir un correo de bootstrap:
--   insert into public.bootstrap_admins (email, role)
--   values ('otro@correo.com', 'admin')   -- o 'editor'
--   on conflict (email) do update set role = excluded.role;

insert into public.bootstrap_admins (email, role)
values ('manumoriles3012@gmail.com', 'admin')
on conflict (email) do update set role = excluded.role;

-- ── Backfill ──────────────────────────────────────────────────────────────
-- Si alguna cuenta ya había iniciado sesión ANTES de aplicar estas
-- migraciones, no tendría fila en `profiles` (el trigger no existía). La
-- creamos ahora, respetando bootstrap_admins.
insert into public.profiles (
  id, email, full_name, avatar_url, status, role, decided_at
)
select
  u.id,
  lower(u.email),
  coalesce(
    u.raw_user_meta_data ->> 'full_name',
    u.raw_user_meta_data ->> 'name'
  ),
  u.raw_user_meta_data ->> 'avatar_url',
  case when b.email is not null then 'approved' else 'pending' end,
  b.role,
  case when b.email is not null then now() end
from auth.users u
left join public.bootstrap_admins b on b.email = lower(u.email)
where u.email is not null
on conflict (id) do nothing;

-- Si el admin ya tenía un perfil 'pending' de una prueba anterior, promuévelo.
update public.profiles p
set status = 'approved',
    role = b.role,
    decided_at = coalesce(p.decided_at, now())
from public.bootstrap_admins b
where p.email = b.email
  and (p.status <> 'approved' or p.role is distinct from b.role);
