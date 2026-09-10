import type { AllergenId } from '../types';

/**
 * Bloque "¡Configura tu Menú como quieras!" de la carta oficial.
 * Origen del seed / del snapshot `--from-source`. En runtime la app lo lee del
 * backend (ver menuStore.ts).
 */

export interface MenuOption {
  title: string;
  detail: string;
  /** Coste adicional en euros (0 = incluido / sin coste). */
  delta: number;
}

export interface MenuGroup {
  key: string;
  heading: string;
  style: 'bullets' | 'priced';
  selection: 'info' | 'single' | 'multiple';
  /** Slugs de categoría donde el bloque se aplica solo. */
  autoCategories: string[];
  items: MenuOption[];
}

export const menuConfig = {
  heading: '¡Configura tu Menú como quieras!',

  /** Alérgenos asociados a las opciones de configuración (pan, salsas, etc.). */
  optionAllergens: ['gluten', 'soja', 'lacteos', 'sulfitos'] as AllergenId[],

  /** Descuentos al quitar guarnición en los menús combo (categoría 'menus'). */
  noFriesDelta: -1,
  noDrinkDelta: -1.5,
  comboCategory: 'menus',

  groups: [
    {
      key: 'incluye',
      heading: 'Cada menú incluye',
      style: 'bullets',
      selection: 'info',
      autoCategories: [],
      items: [
        { title: 'Patatas fritas', detail: '', delta: 0 },
        { title: 'Bebida (cerveza, refresco o agua)', detail: '', delta: 0 },
      ],
    },
    {
      key: 'carne',
      heading: 'Elige tu carne',
      style: 'priced',
      selection: 'single',
      autoCategories: ['menus'],
      items: [
        { title: 'Cerdo', detail: 'La opción de siempre.', delta: 0 },
        { title: 'Ternera', detail: 'Tierna y con un sabor más intenso.', delta: 0.5 },
        {
          title: 'Pollo empanado',
          detail: 'Crujiente por fuera, jugoso por dentro.',
          delta: 0.5,
        },
        { title: 'Buey', detail: 'Para los que buscan más sabor.', delta: 2.0 },
      ],
    },
    {
      key: 'extras',
      heading: 'Extras y mejoras',
      style: 'priced',
      selection: 'multiple',
      autoCategories: ['menus'],
      items: [
        {
          title: 'Cambia las patatas por un complemento',
          detail:
            'Sustituye las patatas fritas por cualquier complemento de la carta.',
          delta: 2.0,
        },
        {
          title: 'Ingrediente extra',
          detail: 'Añade el ingrediente que quieras a tu hamburguesa.',
          delta: 0.5,
        },
        {
          title: 'Extra de salsa',
          detail: 'Un chorreón de más de tu salsa favorita.',
          delta: 0.5,
        },
        { title: 'Hazlo Menú XL', detail: 'Más cantidad, mismo sabor.', delta: 2.0 },
      ],
    },
    {
      key: 'carne-premium',
      heading: 'Elige tu hamburguesa (solo para menus premium)',
      style: 'priced',
      selection: 'single',
      autoCategories: ['premium'],
      items: [
        { title: 'Burger', detail: 'La hamburguesa de siempre.', delta: 0 },
        {
          title: 'Smash burger',
          detail:
            'Carne prensada y sellada a la plancha, más fina y crujiente.',
          delta: 0,
        },
        {
          title: 'Pollo crujiente',
          detail: 'Pollo empanado crujiente por fuera, jugoso por dentro.',
          delta: 0,
        },
      ],
    },
  ] satisfies MenuGroup[],
} as const;
