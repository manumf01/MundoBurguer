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

/**
 * Slugs de categoría de la carta original. Desde la Fase 4 las categorías son
 * dinámicas (se crean/editan desde el panel), así que `Category.id` y
 * `Product.category` son `string`; esta unión queda como referencia y para el
 * seed.
 */
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
  /** Slug de su categoría. */
  category: string;
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
  /** Está en "Nuestros imprescindibles" de la portada. */
  isFeatured?: boolean;
  /** Posición dentro de los destacados (0..n-1). */
  featuredOrder?: number;
  /** Foto del producto (URL absoluta). */
  image?: string;
  /**
   * `key`s de los bloques de "Configura tu Menú" que se aplican a este
   * producto en su vista de detalle (`/carta/<slug>`). Ausente = ninguno.
   */
  configGroupKeys?: string[];
}

export interface Category {
  /** Slug único. */
  id: string;
  label: string;
  tagline: string;
}

/** Una entrada de un bloque de "Configura tu Menú". */
export interface MenuConfigOption {
  title: string;
  /** Descripción (vacío en los bloques de estilo `bullets`). */
  detail: string;
  /** Coste adicional en euros (0 = incluido / sin coste). */
  delta: number;
}

/** Cómo se presenta un bloque en el configurador de producto. */
export type MenuGroupSelection = 'info' | 'single' | 'multiple';

/** Un bloque de "Configura tu Menú" (p. ej. "Cada menú incluye", "Extras…"). */
export interface MenuConfigGroup {
  key: string;
  heading: string;
  /** `bullets` = lista simple; `priced` = con detalle y coste. */
  style: 'bullets' | 'priced';
  /**
   * `info` = solo lista (no elegible); `single` = elegir una (radio, el ítem
   * de 0 € es el incluido); `multiple` = elegir varias (checkbox).
   */
  selection: MenuGroupSelection;
  /**
   * Slugs de categoría cuyos productos aplican este bloque automáticamente
   * (sin marcarlo producto a producto). P. ej. `["menus"]`.
   */
  autoCategories: string[];
  items: MenuConfigOption[];
}

/** El bloque "Configura tu Menú" tal y como lo consume la UI. */
export interface MenuConfigData {
  heading: string;
  optionAllergens: AllergenId[];
  groups: MenuConfigGroup[];
  /** Descuento (≤ 0) al quitar las patatas en un menú combo. */
  noFriesDelta: number;
  /** Descuento (≤ 0) al quitar la bebida en un menú combo. */
  noDrinkDelta: number;
  /**
   * Slug de la categoría cuyos productos incluyen patatas + bebida y por tanto
   * muestran en el configurador los toggles "Sin patatas" / "Sin bebida".
   * `''` = ninguna.
   */
  comboCategory: string;
}

/** La carta completa, lista para la UI (backend, caché o snapshot). */
export interface MenuData {
  categories: Category[];
  products: Product[];
  menuConfig: MenuConfigData;
}

/**
 * Copia estática de la carta que se incluye en el build como último recurso
 * si el backend no responde (ver Fase 4). La regenera `pnpm gen:snapshot`.
 */
export interface MenuSnapshot extends MenuData {
  /** ISO 8601. */
  generatedAt: string;
}
