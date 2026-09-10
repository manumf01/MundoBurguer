export interface PanelNavItem {
  /** Ruta relativa a `/panel` ('' = inicio). */
  to: string;
  label: string;
  /** Solo visible/accesible para el rol admin. */
  adminOnly?: boolean;
}

/** Secciones del panel, en orden. Las de contenido llegan en fases posteriores. */
export const panelNav: PanelNavItem[] = [
  { to: '', label: 'Inicio' },
  { to: 'carta', label: 'Carta' },
  { to: 'categorias', label: 'Categorías' },
  { to: 'menu', label: 'Configura tu Menú' },
  { to: 'destacados', label: 'Destacados' },
  { to: 'solicitudes', label: 'Solicitudes', adminOnly: true },
  { to: 'accesos', label: 'Accesos y roles', adminOnly: true },
];
