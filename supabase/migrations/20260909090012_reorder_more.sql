-- ============================================================================
-- Fase 7 · 0012 · Reordenar categorías y destacados
-- ============================================================================
-- Mismo patrón que reorder_products: una sola UPDATE atómica, gateada por
-- is_approved_staff(). Postgres comprueba las constraints al final de la
-- sentencia, así que el índice único parcial de featured_order no molesta.

create or replace function public.reorder_categories(p_slugs text[])
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_approved_staff() then
    raise exception 'No autorizado';
  end if;

  update public.categories
     set sort_order = array_position(p_slugs, slug) - 1
   where deleted_at is null
     and slug = any(p_slugs);
end;
$$;

create or replace function public.reorder_featured(p_ids uuid[])
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_approved_staff() then
    raise exception 'No autorizado';
  end if;

  update public.products
     set featured_order = array_position(p_ids, id) - 1
   where is_featured
     and deleted_at is null
     and id = any(p_ids);
end;
$$;

grant execute on function public.reorder_categories(text[]) to authenticated;
grant execute on function public.reorder_featured(uuid[]) to authenticated;
