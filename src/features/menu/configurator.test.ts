import { describe, it, expect } from 'vitest';
import type { MenuConfigData, MenuConfigGroup, Product } from './types';
import {
  configuratorGroups,
  EMPTY_SELECTION,
  initSingleSelection,
  isComboProduct,
  priceBreakdown,
} from './configurator';

const group = (over: Partial<MenuConfigGroup>): MenuConfigGroup => ({
  key: 'g',
  heading: 'G',
  style: 'priced',
  selection: 'single',
  autoCategories: [],
  items: [],
  ...over,
});

const carne = group({
  key: 'carne',
  heading: 'Elige tu carne',
  selection: 'single',
  autoCategories: ['menus'],
  items: [
    { title: 'Cerdo', detail: '', delta: 0 },
    { title: 'Ternera', detail: '', delta: 0.5 },
    { title: 'Buey', detail: '', delta: 2 },
  ],
});
const extras = group({
  key: 'extras',
  heading: 'Extras',
  selection: 'multiple',
  autoCategories: ['menus'],
  items: [
    { title: 'XL', detail: '', delta: 2 },
    { title: 'Salsa', detail: '', delta: 0.5 },
  ],
});
const incluye = group({
  key: 'incluye',
  heading: 'Incluye',
  style: 'bullets',
  selection: 'info',
  items: [{ title: 'Patatas', detail: '', delta: 0 }],
});

const menuConfig: MenuConfigData = {
  heading: '',
  optionAllergens: [],
  groups: [incluye, carne, extras],
  noFriesDelta: -1,
  noDrinkDelta: -1.5,
  comboCategory: 'menus',
};

const product = (over: Partial<Product> = {}): Product => ({
  id: 'p',
  name: 'P',
  category: 'menus',
  allergens: [],
  price: 6.5,
  ...over,
});

describe('configuratorGroups', () => {
  it('mezcla asignados a mano + automáticos por categoría, en orden y sin repetir', () => {
    const p = product({ category: 'menus', configGroupKeys: ['incluye'] });
    expect(configuratorGroups(p, menuConfig).map((g) => g.key)).toEqual([
      'incluye',
      'carne',
      'extras',
    ]);
  });

  it('un producto de otra categoría sin claves no ve ningún bloque', () => {
    const p = product({ category: 'bebidas' });
    expect(configuratorGroups(p, menuConfig)).toEqual([]);
  });
});

describe('initSingleSelection', () => {
  it('elige el ítem incluido (delta 0) de cada bloque single', () => {
    expect(initSingleSelection([carne, extras])).toEqual({ carne: 0 });
  });
  it('si no hay ítem a 0, elige el primero', () => {
    const g = group({
      key: 'x',
      selection: 'single',
      items: [
        { title: 'A', detail: '', delta: 1 },
        { title: 'B', detail: '', delta: 2 },
      ],
    });
    expect(initSingleSelection([g])).toEqual({ x: 0 });
  });
});

describe('isComboProduct', () => {
  it('true solo si la categoría coincide con comboCategory', () => {
    expect(isComboProduct(product({ category: 'menus' }), menuConfig)).toBe(
      true
    );
    expect(isComboProduct(product({ category: 'pizzas' }), menuConfig)).toBe(
      false
    );
    expect(
      isComboProduct(product({ category: 'menus' }), {
        ...menuConfig,
        comboCategory: '',
      })
    ).toBe(false);
  });
});

describe('priceBreakdown', () => {
  const groups = [incluye, carne, extras];

  it('sin tocar nada: total = precio base, sin líneas', () => {
    const r = priceBreakdown(product(), menuConfig, groups, {
      ...EMPTY_SELECTION,
      single: initSingleSelection(groups),
    });
    expect(r.basePrice).toBe(6.5);
    expect(r.lines).toEqual([]);
    expect(r.total).toBe(6.5);
  });

  it('bloque single: suma el delta del ítem elegido', () => {
    const r = priceBreakdown(product(), menuConfig, groups, {
      ...EMPTY_SELECTION,
      single: { carne: 2 }, // Buey +2
    });
    expect(r.lines).toEqual([{ label: 'Buey', delta: 2 }]);
    expect(r.total).toBe(8.5);
  });

  it('bloque multiple: suma cada ítem marcado', () => {
    const r = priceBreakdown(product(), menuConfig, groups, {
      ...EMPTY_SELECTION,
      single: initSingleSelection(groups),
      multi: { extras: [0, 1] }, // XL +2, Salsa +0,5
    });
    expect(r.lines.map((l) => l.delta)).toEqual([2, 0.5]);
    expect(r.total).toBe(9);
  });

  it('combo: "sin patatas" y "sin bebida" restan; redondeo limpio', () => {
    const r = priceBreakdown(product({ price: 6.5 }), menuConfig, groups, {
      ...EMPTY_SELECTION,
      single: initSingleSelection(groups),
      noFries: true,
      noDrink: true,
    });
    expect(r.lines).toEqual([
      { label: 'Sin patatas', delta: -1 },
      { label: 'Sin bebida', delta: -1.5 },
    ]);
    expect(r.total).toBe(4);
  });

  it('los toggles del combo no aplican fuera de la categoría combo', () => {
    const r = priceBreakdown(
      product({ category: 'pizzas', price: 8 }),
      menuConfig,
      [],
      { ...EMPTY_SELECTION, noFries: true, noDrink: true }
    );
    expect(r.lines).toEqual([]);
    expect(r.total).toBe(8);
  });

  it('el total nunca es negativo', () => {
    const r = priceBreakdown(product({ price: 1 }), menuConfig, groups, {
      ...EMPTY_SELECTION,
      single: { carne: 0 },
      noFries: true,
      noDrink: true,
    });
    expect(r.total).toBe(0);
  });

  it('precio base por variante según baseIdx', () => {
    const p = product({
      price: undefined,
      variants: [
        { label: 'Individual', price: 7 },
        { label: 'Familiar', price: 12 },
      ],
    });
    const r = priceBreakdown(p, menuConfig, [], {
      ...EMPTY_SELECTION,
      baseIdx: 1,
    });
    expect(r.basePrice).toBe(12);
    expect(r.total).toBe(12);
  });
});
