import { describe, it, expect } from 'vitest';
import { MENU, CATEGORIES, FEATURED_IDS } from './menu';
import { ALLERGEN_ORDER } from './allergens';
import type { AllergenId } from '../types';

const categoryIds = new Set(CATEGORIES.map((c) => c.id));
const allergenIds = new Set<AllergenId>(ALLERGEN_ORDER);
const productIds = new Set(MENU.map((p) => p.id));

describe('carta (menu.ts)', () => {
  it('todos los productos tienen id único', () => {
    expect(productIds.size).toBe(MENU.length);
  });

  it('cada producto pertenece a una categoría válida', () => {
    for (const product of MENU) {
      expect(categoryIds.has(product.category)).toBe(true);
    }
  });

  it('cada producto tiene al menos una forma de precio', () => {
    for (const product of MENU) {
      const hasPrice =
        typeof product.price === 'number' ||
        (product.variants?.length ?? 0) > 0 ||
        (product.tiers?.length ?? 0) > 0;
      expect(hasPrice, `${product.id} sin precio`).toBe(true);
    }
  });

  it('todos los precios son números no negativos', () => {
    for (const product of MENU) {
      const prices = [
        ...(typeof product.price === 'number' ? [product.price] : []),
        ...(product.variants?.map((v) => v.price) ?? []),
        ...(product.tiers?.map((t) => t.price) ?? []),
      ];
      for (const price of prices) {
        expect(Number.isFinite(price)).toBe(true);
        expect(price).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('los alérgenos declarados existen en el catálogo', () => {
    for (const product of MENU) {
      for (const allergen of product.allergens) {
        expect(allergenIds.has(allergen), `${product.id}: ${allergen}`).toBe(
          true
        );
      }
    }
  });

  it('cada categoría de la carta tiene al menos un producto', () => {
    for (const category of CATEGORIES) {
      const count = MENU.filter((p) => p.category === category.id).length;
      expect(count, `categoría ${category.id} vacía`).toBeGreaterThan(0);
    }
  });

  it('los destacados de la home existen en la carta', () => {
    for (const id of FEATURED_IDS) {
      expect(productIds.has(id), `destacado ${id} no existe`).toBe(true);
    }
  });
});
