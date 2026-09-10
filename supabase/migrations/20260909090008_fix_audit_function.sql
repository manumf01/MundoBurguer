-- ============================================================================
-- Fase 2 · 0008 · Arreglo de public.write_audit()
-- ============================================================================
-- La versión de 0004 accedía a new.deleted_at / old.deleted_at directamente,
-- lo que rompe en las tablas que no tienen esa columna (menu_config_meta,
-- menu_config_items): «record "new" has no field "deleted_at"».
--
-- Esta versión lo calcula todo por jsonb. Si ya aplicaste 0004, ejecuta solo
-- este fichero; si partes de cero, 0004 ya viene corregido y este no cambia
-- nada (create or replace).

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
