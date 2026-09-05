export interface NavItem {
  label: string;
  to: string;
  /** Coincidencia exacta de ruta (para "/"). */
  end?: boolean;
}

/** Navegación principal (navbar + menú móvil). */
export const mainNav: NavItem[] = [
  { label: 'Inicio', to: '/', end: true },
  { label: 'Carta', to: '/carta' },
  { label: 'Sobre nosotros', to: '/sobre-nosotros' },
  { label: 'Contacto', to: '/contacto' },
];

/** Enlaces del pie de página. */
export const footerNav: NavItem[] = mainNav;

/** Enlaces a textos legales, en la franja inferior del pie de página. */
export const legalNav: NavItem[] = [
  { label: 'Aviso legal', to: '/aviso-legal' },
  { label: 'Política de privacidad', to: '/politica-privacidad' },
  { label: 'Política de cookies', to: '/politica-cookies' },
];
