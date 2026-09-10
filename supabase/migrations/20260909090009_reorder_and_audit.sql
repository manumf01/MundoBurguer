-- ============================================================================
-- Fase 6 · 0009 · Reordenación de productos + ajuste de auditoría
-- ============================================================================

-- ── write_audit(): no registrar los cambios que solo tocan sort_order ──────
-- Reordenar la carta genera un UPDATE por fila; no son ediciones que merezca
-- la pena auditar una a una.
create or replace function public.write_audit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_new    jsonb := case when tg_op = 'DELETE' then null else to_jsonb(new) end;
  v_old    jsonb := case when tg_op = 'INSERT' then null else to_jsonb(old) end;
  v_row    jsonb := coalesce(v_new, v_old);
  v_action text;
begin
  if tg_op = 'UPDATE'
     and (v_new - 'sort_order' - 'updated_at')
       = (v_old - 'sort_order' - 'updated_at') then
    return null;
  end if;

  if tg_op = 'INSERT' then
    v_action := 'create';
  elsif tg_op = 'DELETE' then
    v_action := 'hard_delete';
  elsif (v_new ->> 'deleted_at') is not null
        and (v_old ->> 'deleted_at') is null then
    v_action := 'delete';
  elsif (v_new ->> 'deleted_at') is null
        and (v_old ->> 'deleted_at') is not null then
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

-- ── reorder_products(): fija sort_order = posición en el array de slugs ─────
create or replace function public.reorder_products(
  p_category_id uuid,
  p_slugs text[]
)
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
     set sort_order = array_position(p_slugs, slug) - 1
   where category_id = p_category_id
     and deleted_at is null
     and slug = any(p_slugs);
end;
$$;

grant execute on function public.reorder_products(uuid, text[]) to authenticated;
