import type {
  AllergenId,
  Category,
  GarnishId,
  MenuConfigData,
  Product,
} from '../types';

/** Filas tal y como las devuelve PostgREST (snake_case). */
export interface DbCategory {
  slug: string;
  label: string;
  tagline: string | null;
  sort_order: number;
}

export interface DbProduct {
  slug: string;
  name: string;
  description: string | null;
  price: number | string | null;
  price_note: string | null;
  variants: { label: string; price: number | string }[] | null;
  tiers: { pieces: number | string; price: number | string }[] | null;
  allergens: string[] | null;
  garnish: string[] | null;
  is_new: boolean;
  is_popular: boolean;
  is_featured: boolean;
  featured_order: number | null;
  image_path: string | null;
  sort_order: number;
  /** Recurso incrustado por la FK category_id. `null` si la categoría está borrada. */
  category: { slug: string; sort_order: number } | null;
  /** Bloques de opciones asignados (incrustados vía product_config_groups). */
  config_groups?: { group: { key: string } | null }[] | null;
}

export interface DbMenuConfigMeta {
  heading: string;
  option_allergens: string[] | null;
  no_fries_delta?: number | string | null;
  no_drink_delta?: number | string | null;
  combo_category_slug?: string | null;
}

export interface DbMenuConfigGroup {
  id: string;
  key: string;
  heading: string;
  style: 'bullets' | 'priced';
  selection: 'info' | 'single' | 'multiple';
  auto_categories?: string[] | null;
  sort_order: number;
}

export interface DbMenuConfigItem {
  group_id: string;
  title: string;
  detail: string;
  delta: number | string;
  sort_order: number;
}

const num = (v: number | string | null | undefined): number => Number(v ?? 0);

export function mapCategory(row: DbCategory): Category {
  return {
    id: row.slug,
    label: row.label,
    tagline: row.tagline ?? '',
  };
}

/**
 * @param storageBase p. ej. `https://<ref>.supabase.co/storage/v1/object/public/menu`
 */
export function mapProduct(row: DbProduct, storageBase: string): Product {
  const product: Product = {
    id: row.slug,
    name: row.name,
    category: row.category?.slug ?? '',
    allergens: (row.allergens ?? []) as AllergenId[],
  };
  if (row.description) product.description = row.description;
  if (row.price != null) product.price = num(row.price);
  if (row.price_note) product.priceNote = row.price_note;
  if (row.variants?.length) {
    product.variants = row.variants.map((v) => ({
      label: v.label,
      price: num(v.price),
    }));
  }
  if (row.tiers?.length) {
    product.tiers = row.tiers.map((t) => ({
      pieces: num(t.pieces),
      price: num(t.price),
    }));
  }
  if (row.garnish?.length) product.garnish = row.garnish as GarnishId[];
  if (row.is_new) product.isNew = true;
  if (row.is_popular) product.isPopular = true;
  if (row.is_featured) {
    product.isFeatured = true;
    if (row.featured_order != null) product.featuredOrder = row.featured_order;
  }
  if (row.image_path) {
    product.image = `${storageBase.replace(/\/$/, '')}/${row.image_path}`;
  }
  const configGroupKeys = (row.config_groups ?? [])
    .map((c) => c.group?.key)
    .filter((k): k is string => Boolean(k));
  if (configGroupKeys.length) product.configGroupKeys = configGroupKeys;
  return product;
}

export function mapMenuConfig(
  meta: DbMenuConfigMeta | null,
  groups: DbMenuConfigGroup[],
  items: DbMenuConfigItem[]
): MenuConfigData {
  return {
    heading: meta?.heading ?? '',
    optionAllergens: (meta?.option_allergens ?? []) as AllergenId[],
    noFriesDelta: meta?.no_fries_delta != null ? num(meta.no_fries_delta) : -1,
    noDrinkDelta:
      meta?.no_drink_delta != null ? num(meta.no_drink_delta) : -1.5,
    comboCategory: meta?.combo_category_slug ?? 'menus',
    groups: [...groups]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((g) => ({
        key: g.key,
        heading: g.heading,
        style: g.style,
        selection: g.selection,
        autoCategories: g.auto_categories ?? [],
        items: items
          .filter((i) => i.group_id === g.id)
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((i) => ({
            title: i.title,
            detail: i.detail,
            delta: num(i.delta),
          })),
      })),
  };
}
