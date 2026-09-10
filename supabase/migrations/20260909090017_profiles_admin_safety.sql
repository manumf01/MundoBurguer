-- ============================================================================
-- Fase 9 · 0017 · Salvaguardas al gestionar accesos/roles desde el panel
-- ============================================================================
-- Las políticas RLS ya dejan al admin leer y actualizar cualquier `profiles`.
-- Este trigger evita dos formas de quedarse fuera:
--   1. Cambiarte a ti mismo el `status`/`role` desde el panel.
--   2. Dejar el sistema sin ningún administrador aprobado.
-- Los cambios por SQL / service_role (sin `auth.uid()`) no se ven afectados.

create or replace function public.guard_profiles_admin_safety()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.id = auth.uid()
     and (new.status is distinct from old.status
          or new.role is distinct from old.role) then
    raise exception
      'No puedes cambiar tu propio acceso o rol desde el panel';
  end if;

  if old.status = 'approved' and old.role = 'admin'
     and not (new.status = 'approved' and new.role = 'admin')
     and (
       select count(*) from public.profiles
        where status = 'approved' and role = 'admin' and id <> old.id
     ) = 0 then
    raise exception 'Debe quedar al menos un administrador aprobado';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_profiles_admin_safety on public.profiles;
create trigger trg_profiles_admin_safety
  before update on public.profiles
  for each row execute function public.guard_profiles_admin_safety();
