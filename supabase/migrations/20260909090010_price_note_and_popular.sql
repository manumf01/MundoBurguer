-- ============================================================================
-- Fase 6c · 0010 · Nota de precio a 50 + "destacado implica popular"
-- ============================================================================

-- La "Nota junto al precio" se limita a 50 caracteres (antes 80).
alter table public.products
  drop constraint if exists products_price_note_check;

-- Recorta cualquier nota existente que supere el nuevo límite, para que la
-- constraint pueda añadirse sin violaciones.
update public.products
   set price_note = left(price_note, 50)
 where price_note is not null and char_length(price_note) > 50;

alter table public.products
  add constraint products_price_note_check
  check (price_note is null or char_length(price_note) <= 50);

-- Toda comida en "Nuestros imprescindibles" (is_featured) debe ser popular.
update public.products
   set is_popular = true
 where is_featured and not is_popular;
