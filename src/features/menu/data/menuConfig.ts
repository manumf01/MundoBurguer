import type { AllergenId } from '../types';

/**
 * Bloque "¡Configura tu Menú como quieras!" de la carta oficial.
 * Es información clave para el cliente: se muestra destacada en la Carta y
 * resumida en la página de inicio.
 */

export interface MenuOption {
  title: string;
  detail: string;
  /** Coste adicional en euros (0 = incluido / sin coste). */
  delta: number;
}

export const menuConfig = {
  heading: '¡Configura tu Menú como quieras!',

  /** Lo que incluye siempre un menú. */
  includes: ['Patatas fritas', 'Bebida (cerveza, refresco o agua)'],

  /** Personalizaciones y su coste. */
  options: [
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
    {
      title: 'Hazlo Menú XL',
      detail: 'Más cantidad, mismo sabor.',
      delta: 2.0,
    },
  ] satisfies MenuOption[],

  /** Elección de carne para el menú. */
  meatChoices: [
    { title: 'Cerdo', detail: 'La opción de siempre.', delta: 0 },
    {
      title: 'Ternera',
      detail: 'Tierna y con un sabor más intenso.',
      delta: 0.5,
    },
    {
      title: 'Pollo empanado',
      detail: 'Crujiente por fuera, jugoso por dentro.',
      delta: 0.5,
    },
    { title: 'Buey', detail: 'Para los que buscan más sabor.', delta: 2.0 },
  ] satisfies MenuOption[],

  /** Alérgenos asociados a las opciones de configuración (pan, salsas, etc.). */
  optionAllergens: ['gluten', 'soja', 'lacteos', 'sulfitos'] as AllergenId[],
} as const;
