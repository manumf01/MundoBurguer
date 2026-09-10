import { describe, it, expect } from 'vitest';
import type { AdminProduct } from './types';
import { adminToProduct } from './preview';

const admin = (over: Partial<AdminProduct> = {}): AdminProduct => ({
  id: 'menu-americano',
  slug: 'menu-americano',
  name: 'Americano',
  description: null,
  categoryId: 'cat-uuid',
  categorySlug: 'menus',
  price: 6.5,
  priceNote: null,
  variants: [],
  tiers: [],
  allergens: ['gluten'],
  garnish: [],
  isNew: false,
  isPopular: false,
  isFeatured: false,
  featuredOrder: null,
  visible: true,
  sortOrder: 0,
  imagePath: null,
  image: null,
  configGroupIds: [],
  ...over,
});

describe('adminToProduct', () => {
  it('mapea lo básico y usa el slug de la categoría', () => {
    const p = adminToProduct(admin());
    expect(p).toMatchObject({
      id: 'menu-americano',
      name: 'Americano',
      category: 'menus',
      price: 6.5,
      allergens: ['gluten'],
    });
  });

  it('omite los campos opcionales vacíos', () => {
    const p = adminToProduct(admin());
    expect(p).not.toHaveProperty('description');
    expect(p).not.toHaveProperty('image');
    expect(p).not.toHaveProperty('isNew');
    expect(p).not.toHaveProperty('variants');
  });

  it('incluye los campos opcionales cuando aplican', () => {
    const p = adminToProduct(
      admin({
        description: 'Con bacon',
        priceNote: 'Gratis con tu Menú',
        garnish: ['tomate'],
        isNew: true,
        isPopular: true,
        isFeatured: true,
        featuredOrder: 2,
        image: 'https://x.supabase.co/img.webp',
      })
    );
    expect(p).toMatchObject({
      description: 'Con bacon',
      priceNote: 'Gratis con tu Menú',
      garnish: ['tomate'],
      isNew: true,
      isPopular: true,
      isFeatured: true,
      featuredOrder: 2,
      image: 'https://x.supabase.co/img.webp',
    });
  });

  it('variantes / tramos: number normalizado y sin precio único', () => {
    const p = adminToProduct(
      admin({
        price: null,
        variants: [{ label: 'Familiar', price: 11 }],
      })
    );
    expect(p).not.toHaveProperty('price');
    expect(p.variants).toEqual([{ label: 'Familiar', price: 11 }]);
  });
});
