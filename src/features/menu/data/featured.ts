/**
 * IDs (slugs) de los productos destacados en la portada, en orden.
 *
 * Provisional: en la Fase 7 esto se gestiona desde el panel (columna
 * `is_featured` / `featured_order` de la BD). De momento es estático y la carta
 * pública lo cruza con los productos que trae del backend.
 */
export const FEATURED_IDS = [
  'premium-la-intensa',
  'premium-la-reverde',
  'menu-americano',
  'suelta-campero',
] as const;
