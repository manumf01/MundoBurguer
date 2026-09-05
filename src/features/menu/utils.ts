import type { Product } from './types';

export interface ProductCardSlots {
  showDescription: boolean;
  showAllergens: boolean;
}

/**
 * Decide qué huecos (descripción, alérgenos/guarnición) deben reservar
 * espacio para un conjunto de productos que se muestran juntos en la misma
 * fila de una cuadrícula.
 *
 * Si NINGÚN producto del grupo tiene descripción (o alérgenos/guarnición), no
 * tiene sentido reservarle ese hueco a ninguna tarjeta del grupo: agrandaría
 * las tarjetas por una información que no existe ahí. En cuanto uno solo del
 * grupo sí la tenga, se reserva para todos y así sus tarjetas siguen
 * alineadas entre sí.
 */
export function getProductCardSlots(products: Product[]): ProductCardSlots {
  return {
    showDescription: products.some((p) => Boolean(p.description)),
    showAllergens: products.some(
      (p) => p.allergens.length > 0 || (p.garnish?.length ?? 0) > 0
    ),
  };
}

/** Trocea una lista, en orden, en grupos de como mucho `size` elementos. */
function chunk<T>(items: T[], size: number): T[][] {
  if (size <= 0) return [items];
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    rows.push(items.slice(i, i + size));
  }
  return rows;
}

/**
 * Calcula los huecos a reservar (ver `getProductCardSlots`) fila a fila, tal
 * y como se ven de verdad en la cuadrícula — no por categoría entera. Una
 * categoría con varias filas puede tener, por ejemplo, una primera fila sin
 * ningún producto con descripción y una segunda donde sí la tengan: cada
 * fila decide solo con lo que hay en ella, así que la primera no arrastra
 * huecos en blanco por lo que haya más abajo.
 *
 * `columns` es el número de columnas ACTUAL de esa cuadrícula (cambia con el
 * ancho de la ventana, ver `useGridColumns`), para que la fila calculada
 * coincida siempre con la fila que se ve en pantalla.
 *
 * Devuelve un Map de `product.id` -> los slots de la fila a la que pertenece,
 * para poder consultarlo al renderizar cada tarjeta.
 */
export function getRowAwareSlots(
  products: Product[],
  columns: number
): Map<string, ProductCardSlots> {
  const map = new Map<string, ProductCardSlots>();
  for (const row of chunk(products, columns)) {
    const slots = getProductCardSlots(row);
    for (const product of row) map.set(product.id, slots);
  }
  return map;
}
