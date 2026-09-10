import type { Category, MenuConfigGroup, Product } from '../types';

/**
 * Transformaciones puras `datos de la app` -> `filas de la BD` para el seed
 * inicial (`scripts/seed.mjs`). Se aíslan aquí para poder testearlas y para
 * garantizar que la migración no pierde nada de `menu.ts` / `menuConfig.ts`.
 *
 * `category_slug` se resuelve a `category_id` dentro del propio script.
 */

export interface CategoryRow {
  slug: string;
  label: string;
  tagline: string | null;
  sort_order: number;
}

export interface ProductRow {
  slug: string;
  name: string;
  description: string | null;
  category_slug: string;
  price: number | null;
  price_note: string | null;
  variants: { label: string; price: number }[];
  tiers: { pieces: number; price: number }[];
  allergens: string[];
  garnish: string[];
  is_new: boolean;
  is_popular: boolean;
  is_featured: boolean;
  featured_order: number | null;
  visible: boolean;
  sort_order: number;
}

export interface MenuGroupRow {
  key: string;
  heading: string;
  style: 'bullets' | 'priced';
  selection: 'info' | 'single' | 'multiple';
  auto_categories: string[];
  sort_order: number;
}

export interface MenuConfigItemRow {
  group_key: string;
  title: string;
  detail: string;
  delta: number;
  sort_order: number;
}

export function toCategoryRows(categories: readonly Category[]): CategoryRow[] {
  return categories.map((c, i) => ({
    slug: c.id,
    label: c.label,
    tagline: c.tagline || null,
    sort_order: i,
  }));
}

export function toProductRows(
  menu: readonly Product[],
  featuredIds: readonly string[]
): ProductRow[] {
  // sort_order = posición del producto DENTRO de su categoría, en el orden
  // en que aparece en `menu.ts` (que es el orden con el que se ve hoy).
  const seenPerCategory = new Map<string, number>();

  return menu.map((p) => {
    const n = seenPerCategory.get(p.category) ?? 0;
    seenPerCategory.set(p.category, n + 1);

    const featuredIndex = featuredIds.indexOf(p.id);

    return {
      slug: p.id,
      name: p.name,
      description: p.description ?? null,
      category_slug: p.category,
      price: p.price ?? null,
      price_note: p.priceNote ?? null,
      variants: (p.variants ?? []).map((v) => ({
        label: v.label,
        price: v.price,
      })),
      tiers: (p.tiers ?? []).map((t) => ({ pieces: t.pieces, price: t.price })),
      allergens: [...p.allergens],
      garnish: [...(p.garnish ?? [])],
      is_new: p.isNew ?? false,
      // Todo destacado es popular (lleva el sello 🔥).
      is_popular: (p.isPopular ?? false) || featuredIndex !== -1,
      is_featured: featuredIndex !== -1,
      featured_order: featuredIndex === -1 ? null : featuredIndex,
      visible: true,
      sort_order: n,
    };
  });
}

export function toMenuConfigRows(groups: readonly MenuConfigGroup[]): {
  groups: MenuGroupRow[];
  items: MenuConfigItemRow[];
} {
  const groupRows: MenuGroupRow[] = groups.map((g, i) => ({
    key: g.key,
    heading: g.heading,
    style: g.style,
    selection: g.selection,
    auto_categories: [...g.autoCategories],
    sort_order: i,
  }));

  const itemRows: MenuConfigItemRow[] = groups.flatMap((g) =>
    g.items.map((it, i) => ({
      group_key: g.key,
      title: it.title,
      detail: it.detail,
      delta: it.delta,
      sort_order: i,
    }))
  );

  return { groups: groupRows, items: itemRows };
}
