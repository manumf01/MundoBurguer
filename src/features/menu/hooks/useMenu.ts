import { useDeferredValue, useMemo, useState } from 'react';
import { CATEGORIES, MENU } from '../data/menu';
import type { AllergenId, CategoryId, Product } from '../types';

export interface MenuCategoryGroup {
  category: (typeof CATEGORIES)[number];
  products: Product[];
}

export interface UseMenuResult {
  search: string;
  setSearch: (value: string) => void;
  excludedAllergens: Set<AllergenId>;
  toggleAllergen: (id: AllergenId) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
  /** Categorías con al menos un producto tras aplicar los filtros. */
  groups: MenuCategoryGroup[];
  totalResults: number;
}

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');

export function useMenu(): UseMenuResult {
  const [search, setSearch] = useState('');
  const [excludedAllergens, setExcludedAllergens] = useState<Set<AllergenId>>(
    () => new Set()
  );

  const deferredSearch = useDeferredValue(search);

  const toggleAllergen = (id: AllergenId) => {
    setExcludedAllergens((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearFilters = () => {
    setSearch('');
    setExcludedAllergens(new Set());
  };

  const hasActiveFilters =
    deferredSearch.trim().length > 0 || excludedAllergens.size > 0;

  const groups = useMemo<MenuCategoryGroup[]>(() => {
    const query = normalize(deferredSearch.trim());

    const matches = (product: Product) => {
      for (const allergen of product.allergens) {
        if (excludedAllergens.has(allergen)) return false;
      }
      if (!query) return true;
      const haystack = normalize(
        `${product.name} ${product.description ?? ''}`
      );
      return haystack.includes(query);
    };

    const byCategory = new Map<CategoryId, Product[]>();
    for (const product of MENU) {
      if (!matches(product)) continue;
      const list = byCategory.get(product.category) ?? [];
      list.push(product);
      byCategory.set(product.category, list);
    }

    return CATEGORIES.map((category) => ({
      category,
      products: byCategory.get(category.id) ?? [],
    })).filter((group) => group.products.length > 0);
  }, [deferredSearch, excludedAllergens]);

  const totalResults = useMemo(
    () => groups.reduce((sum, group) => sum + group.products.length, 0),
    [groups]
  );

  return {
    search,
    setSearch,
    excludedAllergens,
    toggleAllergen,
    clearFilters,
    hasActiveFilters,
    groups,
    totalResults,
  };
}

export function getProductsByIds(ids: readonly string[]): Product[] {
  const index = new Map(MENU.map((product) => [product.id, product]));
  return ids
    .map((id) => index.get(id))
    .filter((product): product is Product => Boolean(product));
}
