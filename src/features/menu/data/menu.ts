import type { Category, Product } from '../types';

// Fotos oficiales (recortadas de las promos de src/docs/).
import imgLaDona from '@/assets/menu/la-dona.webp';
import imgLaIntensa from '@/assets/menu/la-intensa.webp';
import imgLaReverde from '@/assets/menu/la-reverde.webp';
import imgLaToxica from '@/assets/menu/la-toxica.webp';
import imgDonutBurger from '@/assets/menu/mb-donut-burger.webp';
import imgCampero from '@/assets/menu/campero.webp';
import imgTequenos from '@/assets/menu/tequenos.webp';
import imgLotus from '@/assets/menu/tartitas-lotus.webp';
import imgKinder from '@/assets/menu/natillas-kinder.webp';
import imgTartaQueso from '@/assets/menu/tarta-queso.webp';

/**
 * Carta oficial de Mundo Burguer — transcripción íntegra de
 * `src/docs/Z CARTA MB 2024.pdf` + novedades de `src/docs/*.png`.
 *
 * Notas:
 * - Cada MENÚ incluye patatas fritas y bebida (ver `menuConfig.ts`).
 * - Precios en euros. Las pizzas tienen precio Individual y Familiar.
 * - Los complementos se venden por número de piezas (`tiers`).
 * - Los iconos de guarnición (tomate/cebolla/lechuga) son los que muestra
 *   la carta junto a cada menú; pueden variar según disponibilidad.
 */

export const CATEGORIES: Category[] = [
  { id: 'menus', label: 'Menús', tagline: 'Incluyen patatas fritas y bebida' },
  {
    id: 'premium',
    label: 'Premium',
    tagline: 'Burgers de autor · 180 g de vaca selección',
  },
  {
    id: 'pizzas',
    label: 'Pizzas',
    tagline: 'Masa artesana',
    priceHeader: 'Individual · Familiar',
  },
  {
    id: 'complementos',
    label: 'Complementos',
    tagline: 'Para picar, por piezas',
  },
  { id: 'patatas', label: 'Patatas', tagline: 'La guarnición que manda' },
  {
    id: 'raciones',
    label: 'Ensaladas y raciones',
    tagline: 'Para compartir',
  },
  { id: 'bocapizzas', label: 'Bocapizzas', tagline: 'Normal o XL' },
  {
    id: 'empanadas',
    label: 'Empanadas caseras',
    tagline: 'Tamaño 30 × 35 cm',
  },
  {
    id: 'sueltas',
    label: 'A la carta',
    tagline: 'Bocadillos, hamburguesas sueltas y perritos',
  },
  { id: 'bebidas', label: 'Bebidas', tagline: 'Cerveza, refresco o agua' },
  { id: 'postres', label: 'Postres', tagline: 'Caseros e individuales' },
];

const COMPLEMENTO_TIERS_A = [
  { pieces: 6, price: 3.0 },
  { pieces: 9, price: 4.0 },
  { pieces: 12, price: 4.5 },
  { pieces: 25, price: 9.0 },
];

const COMPLEMENTO_TIERS_B = [
  { pieces: 4, price: 3.5 },
  { pieces: 7, price: 5.0 },
  { pieces: 10, price: 6.5 },
  { pieces: 18, price: 11.0 },
];

export const MENU: Product[] = [
  // ───────────────────────── MENÚS ─────────────────────────
  {
    id: 'menu-infantil',
    name: 'Infantil',
    description: 'Hamburguesa con queso y patatas ó nuggets con patatas.',
    category: 'menus',
    price: 5.0,
    allergens: ['gluten', 'soja', 'lacteos', 'sesamo', 'sulfitos'],
  },
  {
    id: 'menu-americano',
    name: 'Americano',
    description: 'Hamburguesa con bacon, salsa barbacoa y queso.',
    category: 'menus',
    price: 6.5,
    isPopular: true,
    garnish: ['tomate', 'cebolla', 'lechuga'],
    allergens: ['gluten', 'soja', 'lacteos', 'mostaza', 'sesamo', 'sulfitos'],
  },
  {
    id: 'menu-italiano',
    name: 'Italiano',
    description: 'Hamburguesa, queso, mostaza y pepinillos.',
    category: 'menus',
    price: 6.5,
    garnish: ['tomate', 'cebolla', 'lechuga'],
    allergens: ['gluten', 'lacteos', 'mostaza', 'sesamo', 'sulfitos'],
  },
  {
    id: 'menu-mejicano',
    name: 'Mejicano',
    description: 'Pollo empanado, queso y salsa brava.',
    category: 'menus',
    price: 6.5,
    garnish: ['tomate', 'cebolla', 'lechuga'],
    allergens: ['gluten', 'huevos', 'lacteos', 'sesamo'],
  },
  {
    id: 'menu-sueco',
    name: 'Sueco',
    description: 'Hamburguesa, queso, lomo sajonia y cebolla crujiente.',
    category: 'menus',
    price: 6.5,
    garnish: ['tomate', 'lechuga'],
    allergens: ['gluten', 'soja', 'lacteos', 'sesamo', 'sulfitos'],
  },
  {
    id: 'menu-frances',
    name: 'Francés',
    description: 'Hamburguesa, bacon, tortilla francesa y queso.',
    category: 'menus',
    price: 6.5,
    garnish: ['tomate', 'cebolla', 'lechuga'],
    allergens: ['gluten', 'huevos', 'soja', 'lacteos', 'sesamo', 'sulfitos'],
  },
  {
    id: 'menu-ruso',
    name: 'Ruso',
    description: 'Hamburguesa doble, queso, pepinillos y ketchup.',
    category: 'menus',
    price: 7.0,
    garnish: ['tomate', 'cebolla', 'lechuga'],
    allergens: ['gluten', 'soja', 'lacteos', 'sesamo'],
  },
  {
    id: 'menu-chileno',
    name: 'Chileno',
    description: 'Pollo empanado, bacon, nachos, queso y salsa césar.',
    category: 'menus',
    price: 7.0,
    garnish: ['tomate', 'cebolla', 'lechuga'],
    allergens: ['gluten', 'huevos', 'soja', 'lacteos', 'mostaza', 'sesamo'],
  },
  {
    id: 'menu-belga',
    name: 'Belga',
    description: 'Hamburguesa, nachos, queso y salsa curry de mango.',
    category: 'menus',
    price: 7.0,
    garnish: ['tomate', 'cebolla', 'lechuga'],
    allergens: [
      'gluten',
      'soja',
      'lacteos',
      'apio',
      'mostaza',
      'sesamo',
      'sulfitos',
    ],
  },
  {
    id: 'menu-iberico',
    name: 'Ibérico',
    description: 'Hamburguesa, tortilla de patatas, jamón serrano y queso.',
    category: 'menus',
    price: 7.0,
    garnish: ['tomate', 'cebolla', 'lechuga'],
    allergens: ['gluten', 'huevos', 'soja', 'lacteos', 'sesamo'],
  },
  {
    id: 'menu-parisino',
    name: 'Parisino',
    description: 'Hamburguesa, aros de cebolla y salsa de queso cheddar.',
    category: 'menus',
    price: 7.5,
    garnish: ['tomate', 'lechuga'],
    allergens: ['gluten', 'soja', 'lacteos', 'sesamo', 'sulfitos'],
  },
  {
    id: 'menu-azteca',
    name: 'Azteca',
    description: 'Pollo empanado, verdura, queso, guacamole y salsa mejicana.',
    category: 'menus',
    price: 7.5,
    garnish: ['tomate', 'cebolla', 'lechuga'],
    allergens: ['gluten', 'huevos', 'lacteos', 'sesamo'],
  },
  {
    id: 'menu-maya',
    name: 'Maya',
    description:
      'Hamburguesa de ternera, bacon, lechuga, queso de cabra, cebolla caramelizada y salsa balsámica.',
    category: 'menus',
    price: 7.5,
    garnish: ['lechuga'],
    allergens: ['gluten', 'soja', 'lacteos', 'sesamo', 'sulfitos'],
  },
  {
    id: 'menu-jalapeno',
    name: 'Jalapeño',
    description:
      'Hamburguesa, huevo frito, jalapeños, queso y salsa de miel y mostaza.',
    category: 'menus',
    price: 7.5,
    garnish: ['tomate', 'cebolla', 'lechuga'],
    allergens: ['gluten', 'huevos', 'soja', 'lacteos'],
  },
  {
    id: 'menu-morileno',
    name: 'Morileño',
    description: 'Hamburguesa gigante, queso, lomo adobado y huevo frito.',
    category: 'menus',
    price: 7.9,
    isPopular: true,
    garnish: ['tomate', 'cebolla', 'lechuga'],
    allergens: ['gluten', 'huevos', 'soja', 'lacteos'],
  },
  {
    id: 'menu-espanol',
    name: 'Español',
    description: 'Lomo adobado, bacon y queso.',
    category: 'menus',
    price: 6.9,
    garnish: ['tomate', 'cebolla', 'lechuga'],
    allergens: ['gluten', 'soja', 'lacteos'],
  },
  {
    id: 'menu-portugues',
    name: 'Portugués',
    description: 'Pechuga de pollo o lomo y queso.',
    category: 'menus',
    price: 6.9,
    garnish: ['tomate', 'cebolla', 'lechuga'],
    allergens: ['gluten', 'lacteos'],
  },
  {
    id: 'menu-cordobes',
    name: 'Cordobés',
    description:
      'Lomo, tortilla francesa, jamón serrano, pimiento verde y queso.',
    category: 'menus',
    price: 7.5,
    allergens: ['gluten', 'huevos'],
  },
  {
    id: 'menu-berlines',
    name: 'Berlinés',
    description: 'Tortilla de patatas, queso y jamón york.',
    category: 'menus',
    price: 6.9,
    allergens: ['gluten', 'huevos', 'lacteos'],
  },
  {
    id: 'menu-turco',
    name: 'Turco',
    description: 'Kebab en pan de torta, pollo, verdura y salsa de yogur.',
    category: 'menus',
    price: 6.5,
    garnish: ['tomate', 'cebolla', 'lechuga'],
    allergens: ['gluten', 'huevos', 'soja', 'lacteos'],
  },
  {
    id: 'menu-britanico',
    name: 'Británico',
    description:
      'Sándwich de jamón york, queso, atún, palitos de mar, tortilla francesa, mahonesa y ketchup.',
    category: 'menus',
    price: 6.0,
    garnish: ['tomate', 'lechuga'],
    allergens: ['gluten', 'huevos', 'lacteos', 'pescado'],
  },
  {
    id: 'menu-neoyorkino',
    name: 'Neoyorkino',
    description:
      'Pechuga de pollo crujiente, lechuga, tomate, bacon a la plancha, queso gouda y salsa BBQ.',
    category: 'menus',
    price: 8.0,
    isNew: true,
    garnish: ['tomate', 'lechuga'],
    allergens: ['gluten', 'huevos', 'soja', 'lacteos', 'mostaza', 'sulfitos'],
  },
  {
    id: 'menu-montana',
    name: 'Montana',
    description:
      'Pechuga de pollo a la plancha, bacon ahumado, cebolla caramelizada, huevo a la plancha y queso de cabra.',
    category: 'menus',
    price: 9.0,
    isNew: true,
    allergens: ['gluten', 'huevos', 'lacteos'],
  },
  {
    id: 'menu-tejano',
    name: 'Tejano',
    description:
      'Burger de vacuno 180 g cocinada al punto, huevo a la plancha, bacon crujiente, pulled pork, queso fundido y salsa de bacon. Todo en pan dulce brioche.',
    category: 'menus',
    price: 10.0,
    isNew: true,
    allergens: ['gluten', 'huevos', 'lacteos', 'mostaza'],
  },
  {
    id: 'menu-dakota',
    name: 'Dakota',
    description:
      'Burger de vacuno 180 g cocinada al punto, rulo de cabra, pimiento caramelizado, cebolla crujiente, bacon a la plancha, queso fundido y salsa americana burger. Todo en pan dulce brioche.',
    category: 'menus',
    price: 11.0,
    isNew: true,
    allergens: ['gluten', 'huevos', 'lacteos', 'mostaza'],
  },

  // ─────────────────────── PREMIUM (novedades) ───────────────────────
  // Alérgenos: solo los que la promo oficial muestra explícitamente.
  {
    id: 'premium-la-dona',
    name: 'La Doña',
    description:
      'Burger de vaca selección 180 g, queso ahumado, pepinillos, salsa Emmy, mermelada de bacon y salsa BibBurger. Acompañada de patatas crispers.',
    category: 'premium',
    price: 12.9,
    isNew: true,
    image: imgLaDona,
    allergens: [],
  },
  {
    id: 'premium-la-intensa',
    name: 'La Intensa',
    description:
      'Crema de palomitas Jumpers, pollo crujiente, queso provolone, tomate seco, mayonesa kimchi y lechuga. Acompañada de patatas crispers.',
    category: 'premium',
    price: 12.9,
    isNew: true,
    image: imgLaIntensa,
    allergens: ['lacteos', 'soja', 'huevos', 'mostaza'],
  },
  {
    id: 'premium-la-reverde',
    name: 'La Reverde',
    description:
      'Burger de vaca selección 180 g, queso ahumado, bacon a la plancha, gublins, mayonesa trufada y crema de pistacho. Acompañada de patatas crispers.',
    category: 'premium',
    price: 12.9,
    isNew: true,
    image: imgLaReverde,
    allergens: [],
  },
  {
    id: 'premium-la-toxica',
    name: 'La Tóxica',
    description:
      'Burger de vaca selección 180 g, queso ahumado, bacon a la plancha, medallón de cebolla frita y salsa barbacoa. Acompañada de patatas crispers.',
    category: 'premium',
    price: 12.9,
    isNew: true,
    image: imgLaToxica,
    allergens: [],
  },
  {
    id: 'premium-mb-donut-burger',
    name: 'MB Donut Burger',
    description:
      'Doble burger smasheada de vacuno, bacon a la plancha, pepinillos, doble queso gouda gratinado, salsa americana burger, salsa de dulce de leche y doble donut tostado a la plancha. Acompañada de patatas crispers.',
    category: 'premium',
    price: 12.9,
    image: imgDonutBurger,
    allergens: [],
  },

  // ───────────────────────── PIZZAS ─────────────────────────
  {
    id: 'pizza-jamon-york',
    name: 'Jamón York',
    description: 'Mozzarella, tomate, orégano y jamón york.',
    category: 'pizzas',
    variants: [
      { label: 'Individual', price: 7.5 },
      { label: 'Familiar', price: 11.0 },
    ],
    allergens: ['gluten', 'lacteos'],
  },
  {
    id: 'pizza-carbonara',
    name: 'Carbonara',
    description: 'Mozzarella, nata, bacon, orégano y champiñón.',
    category: 'pizzas',
    variants: [
      { label: 'Individual', price: 8.5 },
      { label: 'Familiar', price: 12.0 },
    ],
    allergens: ['gluten', 'lacteos'],
  },
  {
    id: 'pizza-barbacoa',
    name: 'Barbacoa',
    description:
      'Mozzarella, tomate, bacon, orégano, carne de ternera y salsa BBQ.',
    category: 'pizzas',
    variants: [
      { label: 'Individual', price: 8.0 },
      { label: 'Familiar', price: 12.0 },
    ],
    allergens: ['gluten', 'lacteos'],
  },
  {
    id: 'pizza-marinera',
    name: 'Marinera',
    description: 'Mozzarella, tomate, salmón, gambas, palitos de mar y atún.',
    category: 'pizzas',
    variants: [
      { label: 'Individual', price: 9.0 },
      { label: 'Familiar', price: 13.0 },
    ],
    allergens: ['gluten', 'lacteos', 'pescado', 'crustaceos'],
  },
  {
    id: 'pizza-maya',
    name: 'Maya',
    description:
      'Mozzarella, tomate, ternera, cebolla caramelizada, rulo de cabra y salsa balsámica.',
    category: 'pizzas',
    variants: [
      { label: 'Individual', price: 9.5 },
      { label: 'Familiar', price: 13.5 },
    ],
    allergens: ['gluten', 'lacteos'],
  },
  {
    id: 'pizza-frankfurt',
    name: 'Frankfurt',
    description: 'Mozzarella, tomate, orégano y salchichas.',
    category: 'pizzas',
    variants: [
      { label: 'Individual', price: 7.5 },
      { label: 'Familiar', price: 11.0 },
    ],
    allergens: ['gluten', 'lacteos'],
  },
  {
    id: 'pizza-burger',
    name: 'Burger',
    description:
      'Mozzarella, tomate, orégano, burger de ternera, 3 quesos y salsa cheddar.',
    category: 'pizzas',
    variants: [
      { label: 'Individual', price: 9.5 },
      { label: 'Familiar', price: 13.5 },
    ],
    allergens: ['gluten', 'lacteos'],
  },
  {
    id: 'pizza-4-quesos',
    name: '4 Quesos',
    description:
      'Mozzarella, tomate, orégano, cheddar, queso gouda y roquefort.',
    category: 'pizzas',
    variants: [
      { label: 'Individual', price: 8.5 },
      { label: 'Familiar', price: 12.0 },
    ],
    allergens: ['gluten', 'lacteos'],
  },
  {
    id: 'pizza-peperonni',
    name: 'Peperonni',
    description: 'Mozzarella, tomate, orégano y peperonni.',
    category: 'pizzas',
    variants: [
      { label: 'Individual', price: 7.5 },
      { label: 'Familiar', price: 11.0 },
    ],
    allergens: ['gluten', 'lacteos'],
  },
  {
    id: 'pizza-kebab',
    name: 'Kebab',
    description:
      'Mozzarella, tomate, orégano, carne de kebab de pollo y cebolla.',
    category: 'pizzas',
    variants: [
      { label: 'Individual', price: 9.0 },
      { label: 'Familiar', price: 13.0 },
    ],
    allergens: ['gluten', 'lacteos'],
  },
  {
    id: 'pizza-pollo',
    name: 'Pollo',
    description:
      'Base de nata, mozzarella, cebolla caramelizada, pechuga de pollo y champiñón.',
    category: 'pizzas',
    isNew: true,
    variants: [
      { label: 'Individual', price: 9.0 },
      { label: 'Familiar', price: 13.0 },
    ],
    allergens: ['gluten', 'lacteos'],
  },
  {
    id: 'pizza-jalapena',
    name: 'Jalapeña',
    description:
      'Mozzarella, tomate, queso de cabra, rodajas de tomate, ternera y jalapeños.',
    category: 'pizzas',
    isNew: true,
    variants: [
      { label: 'Individual', price: 9.0 },
      { label: 'Familiar', price: 13.0 },
    ],
    allergens: ['gluten', 'lacteos'],
  },

  // ─────────────────────── COMPLEMENTOS ───────────────────────
  {
    id: 'comp-bolitas-queso',
    name: 'Bolitas de queso',
    category: 'complementos',
    tiers: COMPLEMENTO_TIERS_A,
    allergens: ['gluten', 'lacteos'],
  },
  {
    id: 'comp-nuggets-pollo',
    name: 'Nuggets de pollo',
    category: 'complementos',
    tiers: COMPLEMENTO_TIERS_A,
    allergens: ['gluten', 'huevos', 'soja', 'lacteos'],
  },
  {
    id: 'comp-aros-cebolla',
    name: 'Aros de cebolla',
    category: 'complementos',
    tiers: COMPLEMENTO_TIERS_A,
    allergens: ['gluten'],
  },
  {
    id: 'comp-triangulos-cheese',
    name: 'Triángulos cheese',
    category: 'complementos',
    tiers: COMPLEMENTO_TIERS_B,
    allergens: ['gluten', 'lacteos'],
  },
  {
    id: 'comp-alitas-pollo',
    name: 'Alitas de pollo',
    category: 'complementos',
    tiers: COMPLEMENTO_TIERS_B,
    allergens: ['gluten', 'huevos', 'lacteos'],
  },

  // ───────────────────────── PATATAS ─────────────────────────
  {
    id: 'patatas-fritas',
    name: 'Patatas fritas',
    category: 'patatas',
    price: 1.0,
    priceNote: 'Gratis con tu menú',
    allergens: [],
  },
  {
    id: 'patatas-gajo',
    name: 'Patatas gajo',
    category: 'patatas',
    price: 2.5,
    priceNote: 'Con menú +1,00 €',
    allergens: [],
  },
  {
    id: 'patatas-bravas',
    name: 'Patatas bravas',
    category: 'patatas',
    price: 4.5,
    allergens: ['gluten', 'lacteos'],
  },
  {
    id: 'patatas-cheddar',
    name: 'Patatas cheddar',
    description: 'Patatas fritas, bacon y queso cheddar.',
    category: 'patatas',
    price: 3.5,
    allergens: ['gluten', 'soja'],
  },
  {
    id: 'patatas-pulled-fries',
    name: 'Pulled fries',
    description: 'Patatas crispers, pulled pork y salsa de miel y mostaza.',
    category: 'patatas',
    price: 4.0,
    isNew: true,
    allergens: ['gluten', 'mostaza'],
  },

  // ─────────────────── ENSALADAS Y RACIONES ───────────────────
  {
    id: 'racion-ensalada-mixta',
    name: 'Ensalada mixta',
    description: 'Lechuga, tomate, maíz y atún.',
    category: 'raciones',
    price: 3.5,
    allergens: ['pescado', 'sulfitos'],
  },
  {
    id: 'racion-ensalada-cesar',
    name: 'Ensalada césar',
    description:
      'Lechuga, tomate, maíz, pechuga de pollo, daditos de queso y salsa césar.',
    category: 'raciones',
    price: 4.5,
    allergens: ['lacteos', 'huevos', 'sulfitos', 'mostaza'],
  },
  {
    id: 'racion-croquetas',
    name: 'Croquetas y patatas',
    category: 'raciones',
    price: 6.0,
    allergens: ['gluten', 'huevos', 'lacteos'],
  },
  {
    id: 'racion-crujientes-pollo',
    name: 'Crujientes de pollo y patatas',
    category: 'raciones',
    price: 6.0,
    allergens: ['gluten', 'huevos'],
  },
  {
    id: 'racion-plato-kebab',
    name: 'Plato de kebab',
    description:
      'Lechuga, tomate, cebolla, carne de kebab, patatas y salsa de yogur.',
    category: 'raciones',
    price: 6.0,
    allergens: ['huevos', 'soja', 'lacteos'],
  },
  {
    id: 'racion-nachos-tres-salsas',
    name: 'Nachos tres salsas',
    description:
      'Nachos mejicanos, guacamole, salsa cheddar, salsa cremfres, ternera, tomate y cebolla.',
    category: 'raciones',
    price: 11.0,
    allergens: ['lacteos', 'soja', 'gluten', 'sulfitos'],
  },
  {
    id: 'racion-tequenos',
    name: 'Tequeños',
    description: 'Rellenos de queso fundido, con salsa.',
    category: 'raciones',
    price: 6.9,
    priceNote: '6 piezas',
    image: imgTequenos,
    allergens: [],
  },

  // ──────────────────────── BOCAPIZZAS ────────────────────────
  {
    id: 'bocapizza',
    name: 'Bocapizza',
    description: 'El clásico bocadillo con sabor a pizza.',
    category: 'bocapizzas',
    variants: [
      { label: 'Normal', price: 3.0 },
      { label: 'XL', price: 5.0 },
    ],
    allergens: ['gluten', 'lacteos'],
  },

  // ─────────────────── EMPANADAS CASERAS (20 €) ───────────────────
  {
    id: 'empanada-atun-tomate',
    name: 'Atún y tomate',
    category: 'empanadas',
    price: 20.0,
    isNew: true,
    allergens: ['gluten', 'huevos', 'pescado'],
  },
  {
    id: 'empanada-atun-pisto',
    name: 'Atún y pisto',
    category: 'empanadas',
    price: 20.0,
    isNew: true,
    allergens: ['gluten', 'huevos', 'pescado'],
  },
  {
    id: 'empanada-jamon-queso',
    name: 'Jamón york y queso',
    category: 'empanadas',
    price: 20.0,
    allergens: ['gluten', 'huevos', 'lacteos'],
  },
  {
    id: 'empanada-jamon-bacon-queso',
    name: 'Jamón york, bacon y queso',
    category: 'empanadas',
    price: 20.0,
    allergens: ['gluten', 'huevos', 'lacteos'],
  },
  {
    id: 'empanada-jamon-bacon',
    name: 'Jamón york y bacon',
    category: 'empanadas',
    price: 20.0,
    allergens: ['gluten', 'huevos'],
  },
  {
    id: 'empanada-carbonara',
    name: 'Empanada de carbonara',
    category: 'empanadas',
    price: 20.0,
    allergens: ['gluten', 'huevos', 'lacteos'],
  },
  {
    id: 'empanada-maya',
    name: 'Empanada maya',
    category: 'empanadas',
    price: 20.0,
    allergens: ['gluten', 'huevos', 'soja', 'lacteos', 'sulfitos'],
  },
  {
    id: 'empanada-serranito',
    name: 'Empanada de serranito',
    category: 'empanadas',
    price: 20.0,
    allergens: ['gluten', 'huevos'],
  },

  // ─────────────────── SUELTAS Y PERRITOS ───────────────────
  {
    id: 'suelta-andorrana',
    name: 'Hamburguesa Andorrana',
    category: 'sueltas',
    price: 2.0,
    allergens: ['gluten', 'soja', 'sesamo', 'sulfitos'],
  },
  {
    id: 'suelta-andorrana-queso',
    name: 'Hamburguesa Andorrana con queso',
    category: 'sueltas',
    price: 2.5,
    allergens: ['gluten', 'soja', 'lacteos', 'sesamo', 'sulfitos'],
  },
  {
    id: 'suelta-perrito-caliente',
    name: 'Perrito caliente',
    category: 'sueltas',
    price: 2.0,
    allergens: ['gluten', 'soja'],
  },
  {
    id: 'suelta-salchicha-prinzs',
    name: 'Salchicha Prinzs',
    description:
      'Salchicha gigante, cebolla caramelizada, bacon, queso, cebolla crujiente y mostaza.',
    category: 'sueltas',
    price: 4.5,
    allergens: ['gluten', 'lacteos', 'mostaza'],
  },
  {
    id: 'suelta-campero',
    name: 'El Campero',
    description:
      'Auténtico bocadillo campero en pan rústico: pechuga de pollo 100 %, bacon, tortilla francesa, jamón serrano, queso, lechuga, tomate, cebolla y mahonesa.',
    category: 'sueltas',
    price: 12.0,
    isNew: true,
    image: imgCampero,
    allergens: [],
  },

  // ───────────────────────── BEBIDAS ─────────────────────────
  {
    id: 'bebida-cerveza',
    name: 'Cerveza',
    category: 'bebidas',
    price: 1.5,
    allergens: ['gluten', 'sulfitos'],
  },
  {
    id: 'bebida-refresco',
    name: 'Refresco',
    category: 'bebidas',
    price: 1.5,
    allergens: [],
  },
  {
    id: 'bebida-agua',
    name: 'Agua',
    category: 'bebidas',
    price: 1.5,
    allergens: [],
  },

  // ───────────────────────── POSTRES ─────────────────────────
  {
    id: 'postre-tartitas-lotus',
    name: 'Tartitas Lotus',
    description: 'Postre casero individual.',
    category: 'postres',
    price: 4.0,
    image: imgLotus,
    allergens: ['lacteos', 'soja', 'gluten'],
  },
  {
    id: 'postre-natillas-kinder',
    name: 'Natillas Kinder',
    description: 'Postre casero individual.',
    category: 'postres',
    price: 4.0,
    image: imgKinder,
    allergens: ['lacteos', 'frutos_cascara', 'soja', 'gluten'],
  },
  {
    id: 'postre-tarta-queso',
    name: 'Tarta de queso',
    description: 'Postre casero individual.',
    category: 'postres',
    price: 4.0,
    image: imgTartaQueso,
    allergens: ['lacteos', 'frutos_cascara', 'soja', 'gluten', 'huevos'],
  },
];

/** Productos destacados para la página de inicio. */
export const FEATURED_IDS = [
  'premium-la-intensa',
  'premium-la-reverde',
  'premium-mb-donut-burger',
  'suelta-campero',
];
