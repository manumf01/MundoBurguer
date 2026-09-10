import { useEffect, useState } from 'react';
import type { MenuConfigData, Category, Product } from '../types';
import {
  peekMenu,
  revalidateMenu,
  shouldRevalidate,
  type MenuSource,
} from '../data/menuStore';

export interface UseMenuDataResult {
  categories: Category[];
  products: Product[];
  menuConfig: MenuConfigData;
  source: MenuSource;
  /** true mientras el dato mostrado aún no viene del backend. */
  stale: boolean;
}

/**
 * Carta lista para pintar. Devuelve al instante lo que haya (caché o snapshot)
 * y revalida contra el backend en cada carga de página; al llegar el dato
 * fresco, se reemplaza. Si la revalidación falla, se mantiene lo anterior sin
 * reintentar en bucle (el snapshot/caché se devuelven con referencia estable).
 */
export function useMenuData(): UseMenuDataResult {
  const [state, setState] = useState(peekMenu);

  useEffect(() => {
    if (!shouldRevalidate(state)) return;
    let active = true;
    revalidateMenu().then((next) => {
      if (active) setState(next);
    });
    return () => {
      active = false;
    };
  }, [state]);

  return {
    categories: state.data.categories,
    products: state.data.products,
    menuConfig: state.data.menuConfig,
    source: state.source,
    stale: state.source !== 'network',
  };
}
