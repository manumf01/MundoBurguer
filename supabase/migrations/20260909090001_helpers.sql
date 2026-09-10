-- ============================================================================
-- Fase 1 · 0001 · Utilidades compartidas
-- ============================================================================
-- Para empezar de cero (⚠️ BORRA todos los datos del panel):
--   drop table if exists
--     public.audit_log, public.menu_config_items, public.menu_config_meta,
--     public.products, public.categories, public.profiles,
--     public.bootstrap_admins cascade;
-- ============================================================================

create extension if not exists pgcrypto with schema extensions;

-- Mantiene `updated_at` al día en cada UPDATE. Se engancha por tabla en las
-- migraciones siguientes.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
