import { useDeferredValue, useMemo, useState } from 'react';
import type {
  AllergenId,
  Category,
  MenuConfigData,
  Product,
} from '../types';
import { useMenuData } from './useMenuData';
import type { MenuSource } from '../data/menuStore';

export interface MenuCategoryGroup {
  category: Category;
  products: Product[];
}

export interface UseMenuResult {
  search: string;
  setSearch: (value: string) => void;
  excludedAllergens: Set<AllergenId>;
  toggleAllergen: (id: AllergenId) => void;
  onlyNew: boolean;
  onlyPopular: boolean;
  toggleOnlyNew: () => void;
  toggleOnlyPopular: () => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
  /** Categorías con al menos un producto tras aplicar los filtros. */
  groups: MenuCategoryGroup[];
  totalResults: number;
  menuConfig: MenuConfigData;
  /** De dónde salen los datos y si aún no son frescos. */
  source: MenuSource;
  stale: boolean;
}

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');

export function useMenu(): UseMenuResult {
  const { categories, products, menuConfig, source, stale } = useMenuData();

  const [search, setSearch] = useState('');
  const [excludedAllergens, setExcludedAllergens] = useState<Set<AllergenId>>(
    () => new Set()
  );
  const [onlyNew, setOnlyNew] = useState(false);
  const [onlyPopular, setOnlyPopular] = useState(false);

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
    setOnlyNew(false);
    setOnlyPopular(false);
  };

  const hasActiveFilters =
    deferredSearch.trim().length > 0 ||
    excludedAllergens.size > 0 ||
    onlyNew ||
    onlyPopular;

  const groups = useMemo<MenuCategoryGroup[]>(() => {
    const query = normalize(deferredSearch.trim());

    const matches = (product: Product) => {
      if (onlyNew && !product.isNew) return false;
      if (onlyPopular && !product.isPopular) return false;
      for (const allergen of product.allergens) {
        if (excludedAllergens.has(allergen)) return false;
      }
      if (!query) return true;
      const haystack = normalize(
        `${product.name} ${product.description ?? ''}`
      );
      return haystack.includes(query);
    };

    const byCategory = new Map<string, Product[]>();
    for (const product of products) {
      if (!matches(product)) continue;
      const list = byCategory.get(product.category) ?? [];
      list.push(product);
      byCategory.set(product.category, list);
    }

    return categories
      .map((category) => ({
        category,
        products: byCategory.get(category.id) ?? [],
      }))
      .filter((group) => group.products.length > 0);
  }, [
    deferredSearch,
    excludedAllergens,
    onlyNew,
    onlyPopular,
    products,
    categories,
  ]);

  const totalResults = useMemo(
    () => groups.reduce((sum, group) => sum + group.products.length, 0),
    [groups]
  );

  return {
    search,
    setSearch,
    excludedAllergens,
    toggleAllergen,
    onlyNew,
    onlyPopular,
    toggleOnlyNew: () => setOnlyNew((v) => !v),
    toggleOnlyPopular: () => setOnlyPopular((v) => !v),
    clearFilters,
    hasActiveFilters,
    groups,
    totalResults,
    menuConfig,
    source,
    stale,
  };
}
