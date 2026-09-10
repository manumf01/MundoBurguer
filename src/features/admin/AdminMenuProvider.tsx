import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { fetchAdminMenu } from './api/adminMenuApi';
import {
  AdminMenuContext,
  EMPTY_CONFIG,
  type AdminMenuContextValue,
} from './adminMenuContext';
import type { AdminCategory, AdminMenuConfig, AdminProduct } from './types';

interface State {
  status: 'loading' | 'ready' | 'error';
  error: string | null;
  products: AdminProduct[];
  categories: AdminCategory[];
  menuConfig: AdminMenuConfig;
}

const INITIAL: State = {
  status: 'loading',
  error: null,
  products: [],
  categories: [],
  menuConfig: EMPTY_CONFIG,
};

/**
 * Carga y mantiene la carta completa (comidas ocultas incluidas, categorías y
 * "Configura tu Menú") para las secciones del panel. Tras cada cambio se llama
 * a `reload()` para que las vistas queden consistentes.
 */
export function AdminMenuProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(INITIAL);

  const reload = useCallback(async () => {
    try {
      const { products, categories, menuConfig } = await fetchAdminMenu();
      setState({
        status: 'ready',
        error: null,
        products,
        categories,
        menuConfig,
      });
    } catch (err) {
      setState((s) => ({
        ...s,
        status: 'error',
        error:
          err instanceof Error
            ? err.message
            : 'No se ha podido cargar la carta. Comprueba tu conexión e inténtalo de nuevo.',
      }));
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const value = useMemo<AdminMenuContextValue>(
    () => ({
      ...state,
      reload,
      productBySlug: (slug) => state.products.find((p) => p.slug === slug),
      categoryById: (id) => state.categories.find((c) => c.id === id),
    }),
    [state, reload]
  );

  return (
    <AdminMenuContext.Provider value={value}>
      {children}
    </AdminMenuContext.Provider>
  );
}
