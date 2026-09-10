import { RequireAdmin } from '@/features/auth/RequireAdmin';
import { SolicitudesPage } from './accesos/SolicitudesPage';
import { AccesosPage } from './accesos/AccesosPage';

/** Secciones del panel solo para admin (gestión de accesos). */

export const PanelSolicitudes = () => (
  <RequireAdmin>
    <SolicitudesPage />
  </RequireAdmin>
);

export const PanelAccesos = () => (
  <RequireAdmin>
    <AccesosPage />
  </RequireAdmin>
);
