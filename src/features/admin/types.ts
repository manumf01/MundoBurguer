import type { AllergenId, GarnishId } from '@/features/menu/types';

export type PriceKind = 'single' | 'variants' | 'tiers';

export interface VariantInput {
  label: string;
  price: string;
}
export interface TierInput {
  pieces: string;
  price: string;
}

/** Valores del formulario de comida (strings/booleans para inputs controlados). */
export interface ProductFormValues {
  slug: string;
  name: string;
  description: string;
  /** uuid de la categoría. */
  categoryId: string;
  priceKind: PriceKind;
  price: string;
  priceNote: string;
  variants: VariantInput[];
  tiers: TierInput[];
  allergens: AllergenId[];
  garnish: GarnishId[];
  isNew: boolean;
  isPopular: boolean;
  visible: boolean;
  /** uuid del imprescindible al que sustituye (si se marca Popular y hay 4). */
  replacesFeaturedId: string;
  /** uuids de los bloques de "Configura tu Menú" aplicados a esta comida. */
  configGroupIds: string[];
}

/** Payload validado, con nombres de columna de la BD. */
export interface ProductInput {
  slug: string;
  name: string;
  description: string | null;
  category_id: string;
  price: number | null;
  price_note: string | null;
  variants: { label: string; price: number }[];
  tiers: { pieces: number; price: number }[];
  allergens: AllergenId[];
  garnish: GarnishId[];
  is_new: boolean;
  is_popular: boolean;
  visible: boolean;
}

export type FieldErrors = Partial<Record<string, string>>;

/** Categoría con su uuid (el panel escribe `category_id`). */
export interface AdminCategory {
  id: string;
  slug: string;
  label: string;
  tagline: string | null;
  sortOrder: number;
}

export interface CategoryFormValues {
  slug: string;
  label: string;
  tagline: string;
}

export interface CategoryInput {
  slug: string;
  label: string;
  tagline: string | null;
}

// ── "Configura tu Menú" ────────────────────────────────────────────────────
export type MenuGroupStyle = 'bullets' | 'priced';
/** Cómo se presenta el bloque en el configurador de producto. */
export type MenuGroupSelection = 'info' | 'single' | 'multiple';

export interface AdminMenuConfigItem {
  id: string;
  groupId: string;
  title: string;
  detail: string;
  delta: number;
  sortOrder: number;
}

export interface AdminMenuConfigGroup {
  id: string;
  key: string;
  heading: string;
  style: MenuGroupStyle;
  selection: MenuGroupSelection;
  /** Slugs de categoría cuyos productos aplican este bloque automáticamente. */
  autoCategories: string[];
  sortOrder: number;
  items: AdminMenuConfigItem[];
}

export interface AdminMenuConfig {
  heading: string;
  optionAllergens: AllergenId[];
  groups: AdminMenuConfigGroup[];
  /** Descuento (≤ 0) al quitar patatas en un menú combo. */
  noFriesDelta: number;
  /** Descuento (≤ 0) al quitar bebida en un menú combo. */
  noDrinkDelta: number;
}

export interface MenuConfigItemInput {
  group_id: string;
  title: string;
  detail: string;
  delta: number;
}

export interface GroupFormValues {
  key: string;
  heading: string;
  selection: MenuGroupSelection;
  autoCategories: string[];
}

export interface MenuGroupInput {
  key: string;
  heading: string;
  /** Derivado de `selection`: 'info' → 'bullets', el resto → 'priced'. */
  style: MenuGroupStyle;
  selection: MenuGroupSelection;
  auto_categories: string[];
}

/** Comida tal y como la maneja el panel (incluye ocultas). */
export interface AdminProduct {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  categoryId: string;
  categorySlug: string;
  price: number | null;
  priceNote: string | null;
  variants: { label: string; price: number }[];
  tiers: { pieces: number; price: number }[];
  allergens: AllergenId[];
  garnish: GarnishId[];
  isNew: boolean;
  isPopular: boolean;
  isFeatured: boolean;
  featuredOrder: number | null;
  visible: boolean;
  sortOrder: number;
  imagePath: string | null;
  /** URL absoluta para la vista previa (o null). */
  image: string | null;
  /** IDs de los bloques de "Configura tu Menú" aplicados a este producto. */
  configGroupIds: string[];
}
