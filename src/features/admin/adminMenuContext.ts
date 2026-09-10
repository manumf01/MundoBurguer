import { createContext } from 'react';
import type { AdminCategory, AdminMenuConfig, AdminProduct } from './types';

export const EMPTY_CONFIG: AdminMenuConfig = {
  heading: '',
  optionAllergens: [],
  groups: [],
  noFriesDelta: -1,
  noDrinkDelta: -1.5,
};

export interface AdminMenuContextValue {
  status: 'loading' | 'ready' | 'error';
  error: string | null;
  products: AdminProduct[];
  categories: AdminCategory[];
  menuConfig: AdminMenuConfig;
  reload: () => Promise<void>;
  productBySlug: (slug: string) => AdminProduct | undefined;
  categoryById: (id: string) => AdminCategory | undefined;
}

export const AdminMenuContext = createContext<AdminMenuContextValue | null>(
  null
);
