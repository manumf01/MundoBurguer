import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { MenuData } from '../types';

vi.mock('../api/menuApi', () => ({
  fetchMenu: vi.fn(),
  menuBackendConfigured: true,
}));

import { fetchMenu } from '../api/menuApi';
import {
  __resetMenuStore,
  peekMenu,
  revalidateMenu,
  shouldRevalidate,
} from './menuStore';

const LS_KEY = 'mb.menu.v4';

const fakeMenu: MenuData = {
  categories: [{ id: 'm', label: 'M', tagline: '' }],
  products: [{ id: 'p', name: 'P', category: 'm', allergens: [] }],
  menuConfig: {
    heading: '',
    optionAllergens: [],
    groups: [],
    noFriesDelta: -1,
    noDrinkDelta: -1.5,
    comboCategory: 'menus',
  },
};

beforeEach(() => {
  localStorage.clear();
  __resetMenuStore();
  vi.mocked(fetchMenu).mockReset();
});

describe('peekMenu', () => {
  it('sin caché ni memoria -> snapshot del build', () => {
    const s = peekMenu();
    expect(s.source).toBe('snapshot');
    expect(s.fetchedAt).toBeNull();
    expect(s.data.products.length).toBeGreaterThan(0);
  });

  it('lee de localStorage si hay -> source "cache"', () => {
    const at = Date.now() - 1000;
    localStorage.setItem(LS_KEY, JSON.stringify({ data: fakeMenu, at }));
    const s = peekMenu();
    expect(s.source).toBe('cache');
    expect(s.fetchedAt).toBe(at);
    expect(s.data.products[0]?.id).toBe('p');
  });

  it('ignora un localStorage corrupto', () => {
    localStorage.setItem(LS_KEY, '{no json');
    expect(peekMenu().source).toBe('snapshot');
  });
});

describe('shouldRevalidate', () => {
  const state = (fetchedAt: number | null) => ({
    data: fakeMenu,
    source: 'cache' as const,
    fetchedAt,
  });

  it('en la primera carga de página revalida siempre', () => {
    expect(shouldRevalidate(state(Date.now()))).toBe(true);
    expect(shouldRevalidate(state(null))).toBe(true);
  });

  it('tras un fetch de esta sesión, solo revalida si el dato es viejo', async () => {
    vi.mocked(fetchMenu).mockResolvedValue(fakeMenu);
    await revalidateMenu(); // marca "ya traído en esta carga"
    expect(shouldRevalidate(state(Date.now()))).toBe(false);
    expect(shouldRevalidate(state(Date.now() - 30 * 1000))).toBe(true);
    expect(shouldRevalidate(state(null))).toBe(true);
  });
});

describe('revalidateMenu', () => {
  it('éxito: guarda en memoria y localStorage, source "network"', async () => {
    vi.mocked(fetchMenu).mockResolvedValue(fakeMenu);
    const s = await revalidateMenu();
    expect(s.source).toBe('network');
    expect(s.fetchedAt).toBeTypeOf('number');
    expect(JSON.parse(localStorage.getItem(LS_KEY)!).data.products[0].id).toBe(
      'p'
    );
    // queda cacheado en memoria
    expect(peekMenu().source).toBe('network');
  });

  it('fallo: devuelve lo que hubiera (snapshot) y NO escribe caché', async () => {
    vi.mocked(fetchMenu).mockRejectedValue(new Error('offline'));
    const s = await revalidateMenu();
    expect(s.source).toBe('snapshot');
    expect(localStorage.getItem(LS_KEY)).toBeNull();
  });

  it('fallo: devuelve la MISMA referencia que peekMenu (sin bucle de reintento)', async () => {
    vi.mocked(fetchMenu).mockRejectedValue(new Error('offline'));
    const before = peekMenu();
    const after = await revalidateMenu();
    expect(after).toBe(before);
  });

  it('coalesce: llamadas concurrentes -> un solo fetch', async () => {
    vi.mocked(fetchMenu).mockResolvedValue(fakeMenu);
    await Promise.all([revalidateMenu(), revalidateMenu(), revalidateMenu()]);
    expect(fetchMenu).toHaveBeenCalledTimes(1);
  });
});
