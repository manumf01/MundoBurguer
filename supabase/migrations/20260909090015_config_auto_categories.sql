-- ============================================================================
-- Fase 8 · 0015 · Bloques del configurador automáticos por categoría
-- ============================================================================
-- · menu_config_groups.auto_categories: slugs de categoría en cuyos productos
--   el bloque se aplica siempre (sin marcarlo producto a producto).
-- · "Elige tu carne" y "Extras y mejoras" -> automáticos en los menús.
-- · Bloque nuevo "Elige tu hamburguesa" (Burger / Smash burger, sin coste)
--   -> automático en Premium.

alter table public.menu_config_groups
  add column if not exists auto_categories text[] not null default '{}';

update public.menu_config_groups
   set auto_categories = array['menus']
 where key in ('carne', 'extras');

insert into public.menu_config_groups
  (key, heading, style, selection, sort_order, auto_categories)
select
  'carne-premium',
  'Elige tu hamburguesa',
  'priced',
  'single',
  coalesce((select max(sort_order) from public.menu_config_groups), 0) + 1,
  array['premium']
where not exists (
  select 1 from public.menu_config_groups where key = 'carne-premium'
);

do $$
declare gid uuid;
begin
  select id into gid
    from public.menu_config_groups where key = 'carne-premium';
  if gid is not null
     and not exists (
       select 1 from public.menu_config_items where group_id = gid
     ) then
    insert into public.menu_config_items
      (group_id, title, detail, delta, sort_order)
    values
      (gid, 'Burger', 'La hamburguesa de siempre.', 0, 0),
      (gid, 'Smash burger',
       'Carne prensada y sellada a la plancha, más fina y crujiente.', 0, 1);
  end if;
end $$;
