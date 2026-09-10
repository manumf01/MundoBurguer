import { ALLERGEN_ORDER } from '@/features/menu/data/allergens';
import type {
  CategoryFormValues,
  CategoryInput,
  FieldErrors,
  GroupFormValues,
  MenuGroupInput,
  MenuGroupStyle,
  ProductFormValues,
  ProductInput,
} from './types';

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ALLERGENS = new Set<string>(ALLERGEN_ORDER);
const GARNISHES = new Set<string>(['tomate', 'cebolla', 'lechuga']);
const MIN_PRICE = 1;
const MAX_PRICE = 50;

/** "menú americano" -> "Menú Americano" (primera letra de cada palabra). */
export function titleCase(value: string): string {
  return value.replace(
    /(^|\s)(\p{L})/gu,
    (_, sep: string, ch: string) => sep + ch.toLocaleUpperCase('es-ES')
  );
}

/** "con doble queso" -> "Con doble queso" (solo la primera letra). */
export function capitalizeFirst(value: string): string {
  return value.replace(
    /^(\s*)(\p{L})/u,
    (_, sp: string, ch: string) => sp + ch.toLocaleUpperCase('es-ES')
  );
}

/** "6,50" o "6.50" -> 6.5. `null` si vacío, `NaN` si no es válido. */
function parseMoney(raw: string): number | null {
  const s = raw.trim().replace(',', '.');
  if (!s) return null;
  if (!/^\d{1,2}(\.\d{1,2})?$/.test(s)) return Number.NaN;
  return Number(s);
}

const badMoney = (n: number | null) =>
  n === null || Number.isNaN(n) || n < MIN_PRICE || n > MAX_PRICE;

export type ValidationResult =
  { ok: true; value: ProductInput } | { ok: false; errors: FieldErrors };

/**
 * Valida el formulario de comida. La BD sigue siendo la autoridad (CHECK /
 * triggers de la migración 0003); esto da feedback inmediato y normaliza.
 */
export function validateProduct(v: ProductFormValues): ValidationResult {
  const errors: FieldErrors = {};

  const name = titleCase(v.name.trim().replace(/\s+/g, ' '));
  if (!name) errors.name = 'El nombre es obligatorio.';
  else if (name.length > 120) errors.name = 'Máximo 120 caracteres.';

  const slug = v.slug.trim();
  if (!slug) errors.slug = 'Falta el identificador (se genera del nombre).';
  else if (!SLUG_RE.test(slug)) errors.slug = 'Identificador no válido.';

  const description = capitalizeFirst(v.description.trim());
  if (description.length > 500) errors.description = 'Máximo 500 caracteres.';

  if (!v.categoryId) errors.categoryId = 'Elige una categoría.';

  const priceNote = v.priceNote.trim();
  if (priceNote.length > 50) errors.priceNote = 'Máximo 50 caracteres.';

  let price: number | null = null;
  const variants: { label: string; price: number }[] = [];
  const tiers: { pieces: number; price: number }[] = [];

  if (v.priceKind === 'single') {
    const p = parseMoney(v.price);
    if (p === null) errors.price = 'Indica el precio.';
    else if (badMoney(p)) errors.price = `Entre ${MIN_PRICE} y ${MAX_PRICE} €.`;
    else price = p;
  } else if (v.priceKind === 'variants') {
    if (v.variants.length === 0)
      errors.variants = 'Añade al menos una variante.';
    v.variants.forEach((row, i) => {
      const label = titleCase(row.label.trim());
      const p = parseMoney(row.price);
      if (!label) errors[`variants.${i}.label`] = 'Falta el nombre.';
      else if (label.length > 40) errors[`variants.${i}.label`] = 'Máx. 40.';
      if (badMoney(p)) errors[`variants.${i}.price`] = 'Precio 1–50.';
      if (label && label.length <= 40 && !badMoney(p)) {
        variants.push({ label, price: p as number });
      }
    });
  } else {
    if (v.tiers.length === 0) errors.tiers = 'Añade al menos un tramo.';
    v.tiers.forEach((row, i) => {
      const pieces = Number(row.pieces.trim());
      const p = parseMoney(row.price);
      const okPieces = Number.isInteger(pieces) && pieces > 0 && pieces <= 999;
      if (!okPieces) errors[`tiers.${i}.pieces`] = 'Piezas: entero 1–999.';
      if (badMoney(p)) errors[`tiers.${i}.price`] = 'Precio 1–50.';
      if (okPieces && !badMoney(p)) tiers.push({ pieces, price: p as number });
    });
  }

  if (v.allergens.some((a) => !ALLERGENS.has(a))) {
    errors.allergens = 'Alérgeno desconocido.';
  }
  if (v.garnish.some((g) => !GARNISHES.has(g))) {
    errors.garnish = 'Guarnición desconocida.';
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    value: {
      slug,
      name,
      description: description || null,
      category_id: v.categoryId,
      price,
      price_note: priceNote || null,
      variants,
      tiers,
      allergens: v.allergens,
      garnish: v.garnish,
      is_new: v.isNew,
      is_popular: v.isPopular,
      visible: v.visible,
    },
  };
}

// ── Categorías ─────────────────────────────────────────────────────────────

export type CategoryValidation =
  { ok: true; value: CategoryInput } | { ok: false; errors: FieldErrors };

export function validateCategory(v: CategoryFormValues): CategoryValidation {
  const errors: FieldErrors = {};

  const label = capitalizeFirst(v.label.trim().replace(/\s+/g, ' '));
  if (!label) errors.label = 'El nombre es obligatorio.';
  else if (label.length > 80) errors.label = 'Máximo 80 caracteres.';

  const slug = v.slug.trim();
  if (!slug) errors.slug = 'Falta el identificador (se genera del nombre).';
  else if (!SLUG_RE.test(slug)) errors.slug = 'Identificador no válido.';

  const tagline = v.tagline.trim();
  if (tagline.length > 120) errors.tagline = 'Máximo 120 caracteres.';

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return { ok: true, value: { slug, label, tagline: tagline || null } };
}

// ── "Configura tu Menú" ────────────────────────────────────────────────────

export type MenuConfigItemValidation =
  | { ok: true; value: { title: string; detail: string; delta: number } }
  | { ok: false; errors: FieldErrors };

export function validateMenuConfigItem(
  style: MenuGroupStyle,
  title: string,
  detail: string,
  deltaRaw: string
): MenuConfigItemValidation {
  const errors: FieldErrors = {};
  const priced = style === 'priced';

  const t = capitalizeFirst(title.trim().replace(/\s+/g, ' '));
  if (!t) errors.title = 'El texto es obligatorio.';
  else if (t.length > 120) errors.title = 'Máximo 120 caracteres.';

  const d = priced ? capitalizeFirst(detail.trim()) : '';
  if (d.length > 240) errors.detail = 'Máximo 240 caracteres.';

  let delta = 0;
  if (priced) {
    const parsed = Number(deltaRaw.trim().replace(',', '.'));
    if (deltaRaw.trim() === '' || !Number.isFinite(parsed)) {
      errors.delta = 'Indica el importe (0 si no cambia el precio).';
    } else if (parsed < -9999 || parsed > 9999) {
      errors.delta = 'Debe estar entre -9999 y 9999.';
    } else {
      delta = Math.round(parsed * 100) / 100;
    }
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, value: { title: t, detail: d, delta } };
}

export type GroupValidation =
  { ok: true; value: MenuGroupInput } | { ok: false; errors: FieldErrors };

export function validateGroup(v: GroupFormValues): GroupValidation {
  const errors: FieldErrors = {};

  const heading = capitalizeFirst(v.heading.trim().replace(/\s+/g, ' '));
  if (!heading) errors.heading = 'El título es obligatorio.';
  else if (heading.length > 80) errors.heading = 'Máximo 80 caracteres.';

  const key = v.key.trim();
  if (!key) errors.key = 'Falta el identificador (se genera del título).';
  else if (!SLUG_RE.test(key)) errors.key = 'Identificador no válido.';

  if (!['info', 'single', 'multiple'].includes(v.selection)) {
    errors.selection = 'Tipo de bloque no válido.';
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  // `style` se deriva: 'info' es una lista simple; el resto lleva coste.
  const style = v.selection === 'info' ? 'bullets' : 'priced';
  return {
    ok: true,
    value: {
      key,
      heading,
      style,
      selection: v.selection,
      auto_categories: [...v.autoCategories],
    },
  };
}
