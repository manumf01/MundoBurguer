-- ============================================================================
-- Fase 8 · 0016 · "Pollo crujiente" en "Elige tu hamburguesa" + tope de 4
--                  destacados
-- ============================================================================

-- ── 1) Nueva opción en el bloque Premium "Elige tu hamburguesa" ─────────────
-- El bloque (key 'carne-premium') se crea en 0015. "Pollo crujiente" no varía
-- el precio (delta 0). Idempotente por título.
do $$
declare gid uuid;
begin
  select id into gid
    from public.menu_config_groups where key = 'carne-premium';
  if gid is null then
    return;
  end if;
  if exists (
    select 1 from public.menu_config_items
     where group_id = gid and title = 'Pollo crujiente'
  ) then
    return;
  end if;

  insert into public.menu_config_items
    (group_id, title, detail, delta, sort_order)
  values (
    gid,
    'Pollo crujiente',
    'Pollo empanado crujiente por fuera, jugoso por dentro.',
    0,
    coalesce(
      (select max(sort_order)
         from public.menu_config_items where group_id = gid),
      -1
    ) + 1
  );
end $$;

-- ── 2) Máximo 4 comidas en "Nuestros imprescindibles" ─────────────────────
-- Si por cambios en el panel quedaron más de 4, se conservan las 4 con el
-- featured_order más bajo y se sueltan el resto; además se renumera 0..3.
with ranked as (
  select
    id,
    row_number() over (order by featured_order nulls last, id) as rn
  from public.products
  where is_featured and deleted_at is null
)
update public.products p
   set is_featured = (r.rn <= 4),
       featured_order = case when r.rn <= 4 then r.rn - 1 else null end
  from ranked r
 where p.id = r.id
   and (
     r.rn > 4
     or p.featured_order is distinct from (r.rn - 1)
   );
