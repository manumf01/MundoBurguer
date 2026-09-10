import { useContext } from 'react';
import {
  AdminMenuContext,
  type AdminMenuContextValue,
} from './adminMenuContext';

export function useAdminMenu(): AdminMenuContextValue {
  const ctx = useContext(AdminMenuContext);
  if (!ctx) {
    throw new Error('useAdminMenu debe usarse dentro de <AdminMenuProvider>');
  }
  return ctx;
}
