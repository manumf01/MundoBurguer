import { describe, it, expect } from 'vitest';
import {
  mapCategory,
  mapMenuConfig,
  mapProduct,
  type DbCategory,
  type DbMenuConfigItem,
  type DbProduct,
} from './mappers';

const STORAGE = 'https://x.supabase.co/storage/v1/object/public/menu';

const dbProduct = (over: Partial<DbProduct> = {}): DbProduct => ({
  slug: 'menu-americano',
  name: 'Americano',
  description: null,
  price: null,
  price_note: null,
  variants: null,
  tiers: null,
  allergens: null,
  garnish: null,
  is_new: false,
  is_popular: false,
  is_featured: false,
  featured_order: null,
  image_path: null,
  sort_order: 0,
  category: { slug: 'menus', sort_order: 0 },
  ...over,
});

describe('mapCategory', () => {
  const base: DbCategory = {
    slug: 'pizzas',
    label: 'Pizzas',
    tagline: null,
    sort_order: 2,
  };

  it('slug -> id, tagline null -> ""', () => {
    expect(mapCategory(base)).toEqual({
      id: 'pizzas',
      label: 'Pizzas',
      tagline: '',
    });
  });
});

describe('mapProduct', () => {
  it('precio único: numérico o string -> number', () => {
    expect(mapProduct(dbProduct({ price: '6.50' }), STORAGE).price).toBe(6.5);
    expect(mapProduct(dbProduct({ price: 7 }), STORAGE).price).toBe(7);
  });

  it('variants y tiers se normalizan a number', () => {
    const p = mapProduct(
      dbProduct({
        variants: [{ label: 'Familiar', price: '11' }],
        tiers: [{ pieces: '6', price: '3.0' }],
      }),
      STORAGE
    );
    expect(p.variants).toEqual([{ label: 'Familiar', price: 11 }]);
    expect(p.tiers).toEqual([{ pieces: 6, price: 3 }]);
  });

  it('image_path -> URL absoluta de Storage; sin imagen -> sin clave', () => {
    expect(
      mapProduct(
        dbProduct({ image_path: 'products/menu-americano.webp' }),
        STORAGE
      ).image
    ).toBe(`${STORAGE}/products/menu-americano.webp`);
    expect(mapProduct(dbProduct(), STORAGE)).not.toHaveProperty('image');
  });

  it('category incrustada -> slug; null -> ""', () => {
    expect(mapProduct(dbProduct(), STORAGE).category).toBe('menus');
    expect(mapProduct(dbProduct({ category: null }), STORAGE).category).toBe(
      ''
    );
  });

  it('flags e info opcional solo cuando aplican', () => {
    const plain = mapProduct(dbProduct(), STORAGE);
    expect(plain).not.toHaveProperty('isNew');
    expect(plain).not.toHaveProperty('isPopular');
    expect(plain).not.toHaveProperty('description');
    expect(plain.garnish).toBeUndefined();

    const rich = mapProduct(
      dbProduct({
        is_new: true,
        is_popular: true,
        description: 'x',
        garnish: ['tomate'],
        allergens: ['gluten'],
      }),
      STORAGE
    );
    expect(rich.isNew).toBe(true);
    expect(rich.isPopular).toBe(true);
    expect(rich.garnish).toEqual(['tomate']);
    expect(rich.allergens).toEqual(['gluten']);
  });

  it('config_groups incrustados -> configGroupKeys; sin ellos -> sin clave', () => {
    expect(mapProduct(dbProduct(), STORAGE)).not.toHaveProperty(
      'configGroupKeys'
    );
    const withGroups = mapProduct(
      dbProduct({
        config_groups: [
          { group: { key: 'carne' } },
          { group: null },
          { group: { key: 'extras' } },
        ],
      }),
      STORAGE
    );
    expect(withGroups.configGroupKeys).toEqual(['carne', 'extras']);
  });
});

describe('mapMenuConfig', () => {
  const groups = [
    {
      id: 'g2',
      key: 'extras',
      heading: 'Extras',
      style: 'priced' as const,
      selection: 'multiple' as const,
      sort_order: 1,
    },
    {
      id: 'g1',
      key: 'incluye',
      heading: 'Incluye',
      style: 'bullets' as const,
      selection: 'info' as const,
      auto_categories: ['menus'],
      sort_order: 0,
    },
  ];
  const items: DbMenuConfigItem[] = [
    { group_id: 'g2', title: 'B', detail: 'db', delta: '0.5', sort_order: 1 },
    { group_id: 'g2', title: 'A', detail: 'da', delta: 0, sort_order: 0 },
    { group_id: 'g1', title: 'Patatas', detail: '', delta: 0, sort_order: 0 },
  ];

  it('ordena grupos e ítems por sort_order y normaliza delta', () => {
    const cfg = mapMenuConfig(
      { heading: 'Configura', option_allergens: ['gluten'] },
      groups,
      items
    );
    expect(cfg.heading).toBe('Configura');
    expect(cfg.groups.map((g) => g.key)).toEqual(['incluye', 'extras']);
    expect(cfg.groups[0]?.items).toEqual([
      { title: 'Patatas', detail: '', delta: 0 },
    ]);
    expect(cfg.groups[1]?.items).toEqual([
      { title: 'A', detail: 'da', delta: 0 },
      { title: 'B', detail: 'db', delta: 0.5 },
    ]);
    expect(cfg.optionAllergens).toEqual(['gluten']);
    expect(cfg.groups[0]?.autoCategories).toEqual(['menus']);
    expect(cfg.groups[1]?.autoCategories).toEqual([]);
  });

  it('meta null -> valores por defecto', () => {
    expect(mapMenuConfig(null, [], [])).toEqual({
      heading: '',
      optionAllergens: [],
      groups: [],
      noFriesDelta: -1,
      noDrinkDelta: -1.5,
      comboCategory: 'menus',
    });
  });
});
