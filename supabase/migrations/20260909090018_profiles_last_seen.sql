-- ============================================================================
-- Fase 9 · 0018 · Última desconexión de cada cuenta
-- ============================================================================
-- `last_seen_at` ≈ la hora en que la sesión dejó de estar activa: el cliente
-- la refresca con un heartbeat mientras el panel está abierto y justo antes de
-- cerrar sesión (botón o cierre por inactividad).

alter table public.profiles
  add column if not exists last_seen_at timestamptz;

-- Va por RPC porque la política de UPDATE de `profiles` es solo para admin.
-- SECURITY DEFINER: solo toca UNA columna de la fila del propio llamante.
create or replace function public.touch_last_seen()
returns void
language sql
security definer
set search_path = public
as $$
  update public.profiles
     set last_seen_at = now()
   where id = auth.uid();
$$;

grant execute on function public.touch_last_seen() to authenticated;
