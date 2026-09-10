-- ============================================================================
-- Fase 1 · 0003 · Carta: categorías, productos y bloque "Configura tu Menú"
-- ============================================================================

-- ── Categorías ─────────────────────────────────────────────────────────────
create table if not exists public.categories (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique
                 check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  label        text not null check (char_length(label) between 1 and 80),
  tagline      text check (char_length(tagline) <= 120),
  price_header text check (char_length(price_header) <= 60),
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  deleted_at   timestamptz
);

create index if not exists categories_order_idx
  on public.categories (sort_order) where deleted_at is null;

drop trigger if exists trg_categories_updated_at on public.categories;
create trigger trg_categories_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

-- ── Productos (comidas) ────────────────────────────────────────────────────
-- El precio adopta UNA de tres formas, igual que hoy en `menu.ts`:
--   price          -> precio único
--   variants jsonb -> [{ "label": "Individual", "price": 7.5 }, ...]
--   tiers    jsonb -> [{ "pieces": 6, "price": 3.0 }, ...]
create table if not exists public.products (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique
                   check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name           text not null check (char_length(name) between 1 and 120),
  description    text check (char_length(description) <= 500),
  category_id    uuid not null references public.categories (id) on delete restrict,
  price          numeric(6, 2) check (price >= 0 and price <= 9999),
  price_note     text check (char_length(price_note) <= 80),
  variants       jsonb not null default '[]'::jsonb,
  tiers          jsonb not null default '[]'::jsonb,
  allergens      text[] not null default '{}',
  garnish        text[] not null default '{}',
  is_new         boolean not null default false,
  is_popular     boolean not null default false,
  is_featured    boolean not null default false,
  featured_order integer,
  image_path     text check (char_length(image_path) <= 300),
  visible        boolean not null default true,
  sort_order     integer not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  deleted_at     timestamptz,

  -- Debe existir al menos una forma de precio (coincide con menu.test.ts).
  constraint products_has_price check (
    price is not null
    or jsonb_array_length(variants) > 0
    or jsonb_array_length(tiers) > 0
  ),
  -- ...y exactamente una (no se combinan).
  constraint products_one_price_form check (
    (case when price is not null then 1 else 0 end)
    + (case when jsonb_array_length(variants) > 0 then 1 else 0 end)
    + (case when jsonb_array_length(tiers) > 0 then 1 else 0 end)
    = 1
  ),
  constraint products_featured_needs_order
    check (not is_featured or featured_order is not null),
  -- Catálogo cerrado de alérgenos (Reglamento UE 1169/2011) y guarniciones.
  constraint products_allergens_valid check (
    allergens <@ array[
      'gluten', 'crustaceos', 'huevos', 'pescado', 'cacahuetes', 'soja',
      'lacteos', 'frutos_cascara', 'apio', 'mostaza', 'sesamo', 'sulfitos',
      'altramuces', 'moluscos'
    ]::text[]
  ),
  constraint products_garnish_valid check (
    garnish <@ array['tomate', 'cebolla', 'lechuga']::text[]
  )
);

create index if not exists products_category_order_idx
  on public.products (category_id, sort_order) where deleted_at is null;

create unique index if not exists products_featured_order_idx
  on public.products (featured_order)
  where is_featured and deleted_at is null;

drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- Valida la forma de `variants` / `tiers` (no cubrible con un CHECK simple).
create or replace function public.validate_product_price_shapes()
returns trigger
language plpgsql
as $$
declare
  elem jsonb;
begin
  if jsonb_typeof(new.variants) <> 'array' then
    raise exception 'variants debe ser un array JSON';
  end if;
  for elem in select * from jsonb_array_elements(new.variants) loop
    if jsonb_typeof(elem -> 'label') is distinct from 'string'
       or char_length(elem ->> 'label') not between 1 and 40 then
      raise exception 'variant.label invalido: %', elem;
    end if;
    if jsonb_typeof(elem -> 'price') is distinct from 'number'
       or (elem ->> 'price')::numeric < 0
       or (elem ->> 'price')::numeric > 9999 then
      raise exception 'variant.price invalido: %', elem;
    end if;
  end loop;

  if jsonb_typeof(new.tiers) <> 'array' then
    raise exception 'tiers debe ser un array JSON';
  end if;
  for elem in select * from jsonb_array_elements(new.tiers) loop
    if jsonb_typeof(elem -> 'pieces') is distinct from 'number'
       or (elem ->> 'pieces')::int <= 0
       or (elem ->> 'pieces')::int > 999 then
      raise exception 'tier.pieces invalido: %', elem;
    end if;
    if jsonb_typeof(elem -> 'price') is distinct from 'number'
       or (elem ->> 'price')::numeric < 0
       or (elem ->> 'price')::numeric > 9999 then
      raise exception 'tier.price invalido: %', elem;
    end if;
  end loop;

  return new;
end;
$$;

drop trigger if exists trg_products_validate_price on public.products;
create trigger trg_products_validate_price
  before insert or update on public.products
  for each row execute function public.validate_product_price_shapes();

-- Impide ocultar/eliminar una categoría que aún tiene productos activos.
create or replace function public.guard_category_delete()
returns trigger
language plpgsql
as $$
begin
  if new.deleted_at is not null and old.deleted_at is null
     and exists (
       select 1 from public.products
       where category_id = new.id and deleted_at is null
     ) then
    raise exception
      'No se puede eliminar una categoria con productos activos';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_categories_guard_delete on public.categories;
create trigger trg_categories_guard_delete
  before update on public.categories
  for each row execute function public.guard_category_delete();

-- ── "Configura tu Menú" (menuConfig.ts) ────────────────────────────────────
-- Metadatos: fila única (id siempre = true).
create table if not exists public.menu_config_meta (
  id               boolean primary key default true check (id),
  heading          text not null default '' check (char_length(heading) <= 120),
  option_allergens text[] not null default '{}'
                     check (option_allergens <@ array[
                       'gluten', 'crustaceos', 'huevos', 'pescado', 'cacahuetes',
                       'soja', 'lacteos', 'frutos_cascara', 'apio', 'mostaza',
                       'sesamo', 'sulfitos', 'altramuces', 'moluscos'
                     ]::text[]),
  updated_at       timestamptz not null default now()
);

insert into public.menu_config_meta (id) values (true)
on conflict (id) do nothing;

drop trigger if exists trg_menu_config_meta_updated_at on public.menu_config_meta;
create trigger trg_menu_config_meta_updated_at
  before update on public.menu_config_meta
  for each row execute function public.set_updated_at();

-- Ítems: incluye / opción-extra / elección de carne.
create table if not exists public.menu_config_items (
  id         uuid primary key default gen_random_uuid(),
  kind       text not null check (kind in ('include', 'option', 'meat_choice')),
  title      text not null check (char_length(title) between 1 and 120),
  detail     text not null default '' check (char_length(detail) <= 240),
  delta      numeric(6, 2) not null default 0
               check (delta >= 0 and delta <= 9999),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists menu_config_items_kind_order_idx
  on public.menu_config_items (kind, sort_order);

drop trigger if exists trg_menu_config_items_updated_at on public.menu_config_items;
create trigger trg_menu_config_items_updated_at
  before update on public.menu_config_items
  for each row execute function public.set_updated_at();
