import type { Product } from '@/features/menu/types';
import type { AdminProduct, PriceKind, ProductFormValues } from './types';

/** Comida del panel -> `Product` de la carta pública (para reusar `ProductCard`). */
export function adminToProduct(p: AdminProduct): Product {
  const product: Product = {
    id: p.id,
    name: p.name,
    category: p.categorySlug,
    allergens: p.allergens,
  };
  if (p.description) product.description = p.description;
  if (p.priceNote) product.priceNote = p.priceNote;
  if (p.garnish.length) product.garnish = p.garnish;
  if (p.isNew) product.isNew = true;
  if (p.isPopular) product.isPopular = true;
  if (p.isFeatured) product.isFeatured = true;
  if (p.featuredOrder != null) product.featuredOrder = p.featuredOrder;
  if (p.image) product.image = p.image;
  if (p.price != null) product.price = p.price;
  if (p.variants.length) product.variants = p.variants;
  if (p.tiers.length) product.tiers = p.tiers;
  return product;
}

/** Convierte los valores del formulario en un `Product` para la vista previa. */
export function toPreviewProduct(
  v: ProductFormValues,
  imageUrl: string | null
): Product {
  const num = (s: string) => {
    const n = Number(s.trim().replace(',', '.'));
    return Number.isFinite(n) ? n : 0;
  };

  const product: Product = {
    id: v.slug || 'preview',
    name: v.name || 'Nombre de la comida',
    category: v.categoryId,
    allergens: v.allergens,
  };

  if (v.description.trim()) product.description = v.description.trim();
  if (v.priceNote.trim()) product.priceNote = v.priceNote.trim();
  if (v.garnish.length) product.garnish = v.garnish;
  if (v.isNew) product.isNew = true;
  if (v.isPopular) product.isPopular = true;
  if (imageUrl) product.image = imageUrl;

  if (v.priceKind === 'single') {
    product.price = num(v.price);
  } else if (v.priceKind === 'variants') {
    product.variants = v.variants
      .filter((x) => x.label.trim())
      .map((x) => ({ label: x.label.trim(), price: num(x.price) }));
  } else {
    product.tiers = v.tiers
      .filter((x) => x.pieces.trim())
      .map((x) => ({ pieces: Number(x.pieces) || 0, price: num(x.price) }));
  }

  return product;
}

/** Formulario en blanco. */
export function emptyForm(): ProductFormValues {
  return {
    slug: '',
    name: '',
    description: '',
    categoryId: '',
    priceKind: 'single',
    price: '',
    priceNote: '',
    variants: [],
    tiers: [],
    allergens: [],
    garnish: [],
    isNew: false,
    isPopular: false,
    visible: true,
    replacesFeaturedId: '',
    configGroupIds: [],
  };
}

/** Comida existente -> valores del formulario. */
export function toFormValues(p: AdminProduct): ProductFormValues {
  const priceKind: PriceKind = p.variants.length
    ? 'variants'
    : p.tiers.length
      ? 'tiers'
      : 'single';

  return {
    slug: p.slug,
    name: p.name,
    description: p.description ?? '',
    categoryId: p.categoryId,
    priceKind,
    price: p.price != null ? String(p.price) : '',
    priceNote: p.priceNote ?? '',
    variants: p.variants.map((v) => ({
      label: v.label,
      price: String(v.price),
    })),
    tiers: p.tiers.map((t) => ({
      pieces: String(t.pieces),
      price: String(t.price),
    })),
    allergens: p.allergens,
    garnish: p.garnish,
    isNew: p.isNew,
    isPopular: p.isPopular,
    visible: p.visible,
    replacesFeaturedId: '',
    configGroupIds: [...p.configGroupIds],
  };
}
