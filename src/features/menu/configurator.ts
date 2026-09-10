import type { MenuConfigData, MenuConfigGroup, Product } from './types';

/** Estado del configurador (índices de opción por bloque + toggles del combo). */
export interface ConfiguratorSelection {
  /** Índice de la variante / tramo usado como precio base. */
  baseIdx: number;
  /** Bloques `single`: `key` -> índice del ítem elegido. */
  single: Record<string, number>;
  /** Bloques `multiple`: `key` -> índices marcados. */
  multi: Record<string, number[]>;
  noFries: boolean;
  noDrink: boolean;
}

export interface PriceLine {
  label: string;
  delta: number;
}

export interface PriceBreakdown {
  basePrice: number;
  lines: PriceLine[];
  /** `basePrice + Σ deltas`, redondeado a 2 decimales y nunca negativo. */
  total: number;
}

export const EMPTY_SELECTION: ConfiguratorSelection = {
  baseIdx: 0,
  single: {},
  multi: {},
  noFries: false,
  noDrink: false,
};

/**
 * Bloques de "Configura tu Menú" que se muestran para un producto: los
 * asignados a mano (`configGroupKeys`) + los automáticos por su categoría
 * (`autoCategories`), en el orden de `menuConfig.groups` y sin repetir.
 */
export function configuratorGroups(
  product: Product,
  menuConfig: MenuConfigData
): MenuConfigGroup[] {
  const keys = new Set(product.configGroupKeys ?? []);
  return menuConfig.groups.filter(
    (g) => keys.has(g.key) || g.autoCategories.includes(product.category)
  );
}

/** Índice inicial de cada bloque `single`: el ítem incluido (delta 0) o el 1º. */
export function initSingleSelection(
  groups: MenuConfigGroup[]
): Record<string, number> {
  const init: Record<string, number> = {};
  for (const g of groups) {
    if (g.selection !== 'single') continue;
    const inc = g.items.findIndex((it) => it.delta === 0);
    init[g.key] = inc === -1 ? 0 : inc;
  }
  return init;
}

/** Un producto "combo" incluye patatas + bebida (categoría configurable). */
export function isComboProduct(
  product: Product,
  menuConfig: MenuConfigData
): boolean {
  return (
    menuConfig.comboCategory !== '' &&
    product.category === menuConfig.comboCategory
  );
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Precio base + líneas de ajuste + total según la selección del cliente. */
export function priceBreakdown(
  product: Product,
  menuConfig: MenuConfigData,
  groups: MenuConfigGroup[],
  sel: ConfiguratorSelection
): PriceBreakdown {
  const variants = product.variants ?? [];
  const tiers = product.tiers ?? [];

  const basePrice =
    product.price ??
    (variants.length > 0
      ? (variants[sel.baseIdx]?.price ?? 0)
      : tiers.length > 0
        ? (tiers[sel.baseIdx]?.price ?? 0)
        : 0);

  const lines: PriceLine[] = [];
  for (const g of groups) {
    if (g.selection === 'single') {
      const it = g.items[sel.single[g.key] ?? 0];
      if (it && it.delta !== 0)
        lines.push({ label: it.title, delta: it.delta });
    } else if (g.selection === 'multiple') {
      for (const idx of sel.multi[g.key] ?? []) {
        const it = g.items[idx];
        if (it && it.delta !== 0)
          lines.push({ label: it.title, delta: it.delta });
      }
    }
  }

  if (isComboProduct(product, menuConfig)) {
    if (sel.noFries)
      lines.push({ label: 'Sin patatas', delta: menuConfig.noFriesDelta });
    if (sel.noDrink)
      lines.push({ label: 'Sin bebida', delta: menuConfig.noDrinkDelta });
  }

  const total = Math.max(
    0,
    round2(basePrice + lines.reduce((s, l) => s + l.delta, 0))
  );
  return { basePrice, lines, total };
}
