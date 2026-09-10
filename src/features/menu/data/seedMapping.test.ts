import { describe, it, expect } from 'vitest';
import { CATEGORIES, MENU, FEATURED_IDS } from './menu';
import { menuConfig } from './menuConfig';
import { ALLERGEN_ORDER } from './allergens';
import { toCategoryRows, toMenuConfigRows, toProductRows } from './seedMapping';

const allergenCatalog = new Set<string>(ALLERGEN_ORDER);
const garnishCatalog = new Set(['tomate', 'cebolla', 'lechuga']);

describe('toCategoryRows', () => {
  const rows = toCategoryRows(CATEGORIES);

  it('conserva todas las categorías, en orden', () => {
    expect(rows).toHaveLength(CATEGORIES.length);
    expect(rows.map((r) => r.slug)).toEqual(CATEGORIES.map((c) => c.id));
    rows.forEach((r, i) => expect(r.sort_order).toBe(i));
  });

  it('lema opcional -> tagline (null si vacío)', () => {
    for (const r of rows) {
      expect(r.tagline === null || typeof r.tagline === 'string').toBe(true);
    }
  });
});

describe('toProductRows', () => {
  const rows = toProductRows(MENU, FEATURED_IDS);

  it('no pierde ningún producto y mantiene slugs únicos', () => {
    expect(rows).toHaveLength(MENU.length);
    expect(new Set(rows.map((r) => r.slug)).size).toBe(MENU.length);
  });

  it('cada fila tiene EXACTAMENTE una forma de precio (constraint de la BD)', () => {
    for (const r of rows) {
      const forms =
        (r.price !== null ? 1 : 0) +
        (r.variants.length > 0 ? 1 : 0) +
        (r.tiers.length > 0 ? 1 : 0);
      expect(forms, `${r.slug}`).toBe(1);
    }
  });

  it('sort_order reinicia por categoría', () => {
    const firstPerCategory = new Map<string, number>();
    for (const r of rows) {
      if (!firstPerCategory.has(r.category_slug)) {
        firstPerCategory.set(r.category_slug, r.sort_order);
      }
    }
    for (const [, first] of firstPerCategory) expect(first).toBe(0);
  });

  it('marca como destacados solo los FEATURED_IDS, en su orden', () => {
    const featured = rows
      .filter((r) => r.is_featured)
      .sort((a, b) => (a.featured_order ?? 0) - (b.featured_order ?? 0));
    expect(featured.map((r) => r.slug)).toEqual([...FEATURED_IDS]);
    featured.forEach((r, i) => expect(r.featured_order).toBe(i));
    for (const r of rows) {
      if (!r.is_featured) expect(r.featured_order).toBeNull();
    }
  });

  it('alérgenos y guarniciones dentro del catálogo cerrado', () => {
    for (const r of rows) {
      for (const a of r.allergens) {
        expect(allergenCatalog.has(a), `${r.slug}: ${a}`).toBe(true);
      }
      for (const g of r.garnish) {
        expect(garnishCatalog.has(g), `${r.slug}: ${g}`).toBe(true);
      }
    }
  });
});

describe('toMenuConfigRows', () => {
  const { groups, items } = toMenuConfigRows(menuConfig.groups);

  it('un grupo por bloque, con su key y orden', () => {
    expect(groups.map((g) => g.key)).toEqual(
      menuConfig.groups.map((g) => g.key)
    );
    groups.forEach((g, i) => expect(g.sort_order).toBe(i));
  });

  it('cada ítem lleva su group_key y sort_order por grupo', () => {
    for (const g of menuConfig.groups) {
      const rows = items.filter((it) => it.group_key === g.key);
      expect(rows).toHaveLength(g.items.length);
      expect(rows.map((r) => r.sort_order)).toEqual(rows.map((_, i) => i));
    }
  });

  it('no pierde ningún ítem', () => {
    const total = menuConfig.groups.reduce((n, g) => n + g.items.length, 0);
    expect(items).toHaveLength(total);
  });
});
