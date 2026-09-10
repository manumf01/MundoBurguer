import { describe, it, expect } from 'vitest';
import {
  capitalizeFirst,
  sanitizePriceInput,
  titleCase,
  validateCategory,
  validateMenuConfigItem,
  validateProduct,
} from './validation';
import type { CategoryFormValues, ProductFormValues } from './types';

const base: ProductFormValues = {
  slug: 'menu-americano',
  name: 'Americano',
  description: '',
  categoryId: 'cat-uuid',
  priceKind: 'single',
  price: '6,50',
  priceNote: '',
  variants: [],
  tiers: [],
  allergens: ['gluten'],
  garnish: ['tomate'],
  isNew: false,
  isPopular: false,
  visible: true,
  replacesFeaturedId: '',
  configGroupIds: [],
};

const ok = (v: ProductFormValues) => {
  const r = validateProduct(v);
  if (!r.ok) throw new Error(`esperaba ok: ${JSON.stringify(r.errors)}`);
  return r.value;
};
const errs = (v: ProductFormValues) => {
  const r = validateProduct(v);
  if (r.ok) throw new Error('esperaba errores');
  return r.errors;
};

describe('titleCase', () => {
  it('capitaliza la primera letra de cada palabra', () => {
    expect(titleCase('menú americano')).toBe('Menú Americano');
    expect(titleCase('hamburguesa  con   queso')).toBe('Hamburguesa  Con   Queso');
    expect(titleCase('LA TóXICA')).toBe('LA TóXICA');
  });
});

describe('sanitizePriceInput', () => {
  it('quita letras y limita a XX,XX', () => {
    expect(sanitizePriceInput('6a', '6')).toBe('6');
    expect(sanitizePriceInput('6.5', '6')).toBe('6,5');
    expect(sanitizePriceInput('12,34', '12,3')).toBe('12,34');
    expect(sanitizePriceInput('123', '12')).toBe('12');
    expect(sanitizePriceInput('6,345', '6,34')).toBe('6,34');
    expect(sanitizePriceInput('', '6')).toBe('');
  });
});

describe('validateProduct', () => {
  it('normaliza el nombre a Título y acepta coma decimal', () => {
    const value = ok({ ...base, name: 'menú americano' });
    expect(value.name).toBe('Menú Americano');
    expect(value.price).toBe(6.5);
  });

  it('precio fuera de 1–50, con 3 decimales o vacío', () => {
    expect(errs({ ...base, price: '' })).toHaveProperty('price');
    expect(errs({ ...base, price: '0' })).toHaveProperty('price');
    expect(errs({ ...base, price: '55' })).toHaveProperty('price');
    expect(errs({ ...base, price: '1,234' })).toHaveProperty('price');
    expect(ok({ ...base, price: '1' }).price).toBe(1);
    expect(ok({ ...base, price: '50' }).price).toBe(50);
  });

  it('la descripción se capitaliza y admite números', () => {
    expect(
      ok({ ...base, description: 'con 2 lonchas de queso' }).description
    ).toBe('Con 2 lonchas de queso');
  });

  it('capitalizeFirst solo toca la primera letra', () => {
    expect(capitalizeFirst('con doble queso')).toBe('Con doble queso');
    expect(capitalizeFirst('  áspero')).toBe('  Áspero');
  });

  it('variantes: al menos una, label y precio 1–50', () => {
    expect(
      errs({ ...base, priceKind: 'variants', price: '', variants: [] })
    ).toHaveProperty('variants');

    const value = ok({
      ...base,
      priceKind: 'variants',
      price: '',
      variants: [
        { label: 'individual', price: '7,5' },
        { label: 'familiar', price: '11' },
      ],
    });
    expect(value.price).toBeNull();
    expect(value.variants).toEqual([
      { label: 'Individual', price: 7.5 },
      { label: 'Familiar', price: 11 },
    ]);
  });

  it('tiers: piezas entero 1–999', () => {
    expect(
      errs({
        ...base,
        priceKind: 'tiers',
        price: '',
        tiers: [{ pieces: '0', price: '3' }],
      })
    ).toHaveProperty('tiers.0.pieces');
    expect(
      ok({
        ...base,
        priceKind: 'tiers',
        price: '',
        tiers: [{ pieces: '6', price: '3' }],
      }).tiers
    ).toEqual([{ pieces: 6, price: 3 }]);
  });

  it('nombre obligatorio; priceNote > 50', () => {
    expect(errs({ ...base, name: '  ' })).toHaveProperty('name');
    expect(errs({ ...base, priceNote: 'a'.repeat(51) })).toHaveProperty(
      'priceNote'
    );
    expect(ok({ ...base, priceNote: 'a'.repeat(50) }).price_note).toBe(
      'a'.repeat(50)
    );
  });

  it('rechaza alérgeno / guarnición fuera de catálogo', () => {
    // @ts-expect-error valor inválido a propósito
    expect(errs({ ...base, allergens: ['pepino'] })).toHaveProperty('allergens');
    // @ts-expect-error valor inválido a propósito
    expect(errs({ ...base, garnish: ['pepinillo'] })).toHaveProperty('garnish');
  });
});

const cat: CategoryFormValues = {
  slug: 'menus',
  label: 'Menús',
  tagline: '',
};

describe('validateCategory', () => {
  it('normaliza label (1ª mayúscula) y limpia opcionales', () => {
    const v = validateCategory({ ...cat, label: '  ensaladas y raciones ' });
    expect(v.ok && v.value).toEqual({
      slug: 'menus',
      label: 'Ensaladas y raciones',
      tagline: null,
    });
  });

  it('label obligatorio; slug con formato; longitud del lema', () => {
    expect(validateCategory({ ...cat, label: ' ' }).ok).toBe(false);
    expect(validateCategory({ ...cat, slug: 'Con Espacios' }).ok).toBe(false);
    expect(validateCategory({ ...cat, tagline: 'x'.repeat(121) }).ok).toBe(
      false
    );
  });
});

describe('validateMenuConfigItem', () => {
  it('bullets: solo título, sin detail ni delta', () => {
    const v = validateMenuConfigItem('bullets', 'patatas fritas', 'ignora', '9');
    expect(v.ok && v.value).toEqual({
      title: 'Patatas fritas',
      detail: '',
      delta: 0,
    });
  });

  it('priced: título + delta 0–9999', () => {
    expect(
      validateMenuConfigItem('priced', 'Extra salsa', 'un chorreón', '').ok
    ).toBe(false);
    const v = validateMenuConfigItem(
      'priced',
      'extra salsa',
      'un chorreón',
      '0,5'
    );
    expect(v.ok && v.value.delta).toBe(0.5);
    expect(v.ok && v.value.title).toBe('Extra salsa');
    expect(
      validateMenuConfigItem('priced', 'Buey', 'sabor', '99999').ok
    ).toBe(false);
  });

  it('priced: admite importes negativos (descuentos)', () => {
    const v = validateMenuConfigItem('priced', 'Sin bebida', '', '-1,5');
    expect(v.ok && v.value.delta).toBe(-1.5);
    expect(
      validateMenuConfigItem('priced', 'X', '', '-99999').ok
    ).toBe(false);
  });
});
