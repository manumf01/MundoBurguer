import type { MenuData } from '../types';
import {
  mapCategory,
  mapMenuConfig,
  mapProduct,
  type DbCategory,
  type DbMenuConfigGroup,
  type DbMenuConfigItem,
  type DbMenuConfigMeta,
  type DbProduct,
} from './mappers';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, '');
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** La carta pública puede leer del backend. Si no, se usa el snapshot. */
export const menuBackendConfigured = Boolean(SUPABASE_URL && ANON_KEY);

const STORAGE_BASE = `${SUPABASE_URL}/storage/v1/object/public/menu`;

/**
 * Lectura anónima vía PostgREST con `fetch` a pelo (sin `@supabase/supabase-js`)
 * para no meter el SDK en el bundle público. Las políticas RLS se aplican
 * igual: la anon key resuelve el rol `anon` y solo ve lo no borrado / visible.
 */
async function rest<T>(query: string): Promise<T> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${query}`, {
    headers: {
      apikey: ANON_KEY as string,
      Authorization: `Bearer ${ANON_KEY}`,
      Accept: 'application/json',
    },
    // Un backend colgado no debe dejar la carta en "cargando" indefinidamente:
    // al abortar, `revalidateMenu` cae al snapshot/caché.
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) {
    throw new Error(
      `Supabase REST ${res.status} en ${query.split('?')[0]}: ${await res
        .text()
        .catch(() => '')}`
    );
  }
  return res.json() as Promise<T>;
}

export async function fetchMenu(): Promise<MenuData> {
  if (!menuBackendConfigured) {
    throw new Error('Backend de la carta sin configurar');
  }

  const [cats, prods, metaRows, groups, items] = await Promise.all([
    rest<DbCategory[]>(
      'categories?select=slug,label,tagline,sort_order' +
        '&deleted_at=is.null&order=sort_order'
    ),
    rest<DbProduct[]>(
      'products?select=slug,name,description,price,price_note,variants,tiers,' +
        'allergens,garnish,is_new,is_popular,is_featured,featured_order,' +
        'image_path,sort_order,category:categories(slug,sort_order),' +
        'config_groups:product_config_groups(group:menu_config_groups(key))' +
        '&deleted_at=is.null&visible=is.true&order=sort_order'
    ),
    rest<DbMenuConfigMeta[]>(
      'menu_config_meta?select=heading,option_allergens,no_fries_delta,' +
        'no_drink_delta,combo_category_slug&limit=1'
    ),
    rest<DbMenuConfigGroup[]>(
      'menu_config_groups?select=id,key,heading,style,selection,' +
        'auto_categories,sort_order&order=sort_order'
    ),
    rest<DbMenuConfigItem[]>(
      'menu_config_items?select=group_id,title,detail,delta,sort_order&order=sort_order'
    ),
  ]);

  const catOrder = new Map(cats.map((c) => [c.slug, c.sort_order]));
  const ordered = [...prods].sort((a, b) => {
    const ca = catOrder.get(a.category?.slug ?? '') ?? Number.MAX_SAFE_INTEGER;
    const cb = catOrder.get(b.category?.slug ?? '') ?? Number.MAX_SAFE_INTEGER;
    return ca - cb || a.sort_order - b.sort_order;
  });

  return {
    categories: cats.map(mapCategory),
    products: ordered.map((row) => mapProduct(row, STORAGE_BASE)),
    menuConfig: mapMenuConfig(metaRows[0] ?? null, groups, items),
  };
}
