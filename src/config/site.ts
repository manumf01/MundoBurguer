/**
 * Fuente única de verdad para los datos del negocio.
 * Extraído de la carta oficial (src/docs/Z CARTA MB 2024.pdf).
 */

const siteUrl = (
  import.meta.env.VITE_SITE_URL ?? 'https://www.mundoburguer.es'
).replace(/\/$/, '');

export const site = {
  name: 'Mundo Burguer',
  legalName: 'Mundo Burguer Moriles',
  slogan: 'El sabor de la auténtica Hamburguesa',
  shortDescription:
    'Menús del mundo, pizzas, empanadas caseras y más en Moriles (Córdoba).',
  url: siteUrl,

  phone: {
    display: '635 306 777',
    /** Formato E.164 para enlaces tel:/wa.me */
    e164: '+34635306777',
    whatsapp: 'https://wa.me/34635306777',
  },

  address: {
    street: 'C/ Monturque, nº 1',
    postalCode: '14510',
    city: 'Moriles',
    province: 'Córdoba',
    country: 'España',
    /** Coordenadas aproximadas de Moriles (ajustar con la ubicación exacta). */
    geo: { lat: 37.4419, lng: -4.6389 },
    get full() {
      return `${this.street} | ${this.postalCode}, ${this.city} (${this.province})`;
    },
    mapsQuery: 'Mundo Burguer, C/ Monturque 1, 14510 Moriles, Córdoba',
  },

  hours: {
    summary: 'Fines de semana y festivos, desde las 20:00h hasta cierre',
    note: 'Consúltanos festivos y fechas especiales por teléfono o redes sociales.',
    /** openingHours en formato schema.org (Sáb y Dom desde las 20:00). */
    schema: ['Sa 20:00-23:59', 'Su 20:00-23:59'],
  },

  delivery: {
    available: true,
    label: 'Haz tu pedido a domicilio',
  },

  social: {
    // TODO: sustituir por las URLs exactas de los perfiles reales.
    facebook: 'https://www.facebook.com/MundoBurguerMoriles',
    facebookLabel: 'Mundo Burguer Moriles',
    instagram: 'https://www.instagram.com/mundoburguermoriles',
    instagramLabel: '@mundoburguermoriles',
  },

  /** Aviso legal de alérgenos, literal de la carta. */
  allergenNotice:
    'Todos nuestros productos contienen alérgenos de uno u otro grupo. Téngalo en cuenta si padece alguna alergia alimentaria.',

  priceRange: '€€',
  cuisine: ['Hamburguesas', 'Pizzas', 'Comida rápida', 'Kebab'],
} as const;

export type Site = typeof site;
