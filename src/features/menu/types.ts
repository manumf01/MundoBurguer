/** Los 14 alérgenos de declaración obligatoria (Reglamento UE 1169/2011). */
export type AllergenId =
  | 'gluten'
  | 'crustaceos'
  | 'huevos'
  | 'pescado'
  | 'cacahuetes'
  | 'soja'
  | 'lacteos'
  | 'frutos_cascara'
  | 'apio'
  | 'mostaza'
  | 'sesamo'
  | 'sulfitos'
  | 'altramuces'
  | 'moluscos';

/** Guarnición fresca que acompaña a la hamburguesa (iconos de la carta). */
export type GarnishId = 'tomate' | 'cebolla' | 'lechuga';

export type CategoryId =
  | 'menus'
  | 'premium'
  | 'pizzas'
  | 'complementos'
  | 'patatas'
  | 'raciones'
  | 'bocapizzas'
  | 'empanadas'
  | 'sueltas'
  | 'bebidas'
  | 'postres';

export interface PriceVariant {
  label: string;
  price: number;
}

export interface PieceTier {
  pieces: number;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  category: CategoryId;
  /** Precio único. */
  price?: number;
  /** Precios por variante (p. ej. Individual / Familiar). */
  variants?: PriceVariant[];
  /** Precio por número de piezas (complementos). */
  tiers?: PieceTier[];
  /** Nota junto al precio (p. ej. "Gratis con tu Menú"). */
  priceNote?: string;
  allergens: AllergenId[];
  garnish?: GarnishId[];
  isNew?: boolean;
  isPopular?: boolean;
  /** Reservado para el futuro: foto de producto. */
  image?: string;
}

export interface Category {
  id: CategoryId;
  label: string;
  tagline: string;
  /** Encabezado de precios para variantes (p. ej. "Individual · Familiar"). */
  priceHeader?: string;
}
