import { Outlet } from 'react-router-dom';
import { AdminMenuProvider } from '@/features/admin';

/** Provee la carta completa (con ocultas) a las páginas de `/panel/carta`. */
export function PanelMenuArea() {
  return (
    <AdminMenuProvider>
      <Outlet />
    </AdminMenuProvider>
  );
}
