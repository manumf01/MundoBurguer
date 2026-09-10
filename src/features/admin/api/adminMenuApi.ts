import { getSupabase } from '@/lib/supabase';
import type { AllergenId, GarnishId } from '@/features/menu/types';
import type {
  AdminCategory,
  AdminMenuConfig,
  AdminProduct,
  CategoryInput,
  MenuConfigItemInput,
  MenuGroupInput,
  MenuGroupSelection,
  MenuGroupStyle,
  ProductInput,
} from '../types';

const STORAGE_BASE = `${import.meta.env.VITE_SUPABASE_URL?.replace(
  /\/$/,
  ''
)}/storage/v1/object/public/menu`;

const PRODUCT_COLS =
  'id,slug,name,description,category_id,price,price_note,variants,tiers,' +
  'allergens,garnish,is_new,is_popular,is_featured,featured_order,visible,' +
  'sort_order,image_path,category:categories(slug),' +
  'config_groups:product_config_groups(group_id)';

interface DbAdminProductRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category_id: string;
  price: number | string | null;
  price_note: string | null;
  variants: { label: string; price: number | string }[] | null;
  tiers: { pieces: number | string; price: number | string }[] | null;
  allergens: string[] | null;
  garnish: string[] | null;
  is_new: boolean;
  is_popular: boolean;
  is_featured: boolean;
  featured_order: number | null;
  visible: boolean;
  sort_order: number;
  image_path: string | null;
  category: { slug: string } | null;
  config_groups: { group_id: string }[] | null;
}

interface DbAdminCategoryRow {
  id: string;
  slug: string;
  label: string;
  tagline: string | null;
  sort_order: number;
}

interface DbMenuConfigGroupRow {
  id: string;
  key: string;
  heading: string;
  style: MenuGroupStyle;
  selection: MenuGroupSelection;
  auto_categories: string[] | null;
  sort_order: number;
}

interface DbMenuConfigItemRow {
  id: string;
  group_id: string;
  title: string;
  detail: string;
  delta: number | string;
  sort_order: number;
}

const num = (v: number | string | null | undefined) => Number(v ?? 0);

function toAdminProduct(r: DbAdminProductRow): AdminProduct {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    description: r.description,
    categoryId: r.category_id,
    categorySlug: r.category?.slug ?? '',
    price: r.price == null ? null : num(r.price),
    priceNote: r.price_note,
    variants: (r.variants ?? []).map((v) => ({
      label: v.label,
      price: num(v.price),
    })),
    tiers: (r.tiers ?? []).map((t) => ({
      pieces: num(t.pieces),
      price: num(t.price),
    })),
    allergens: (r.allergens ?? []) as AllergenId[],
    garnish: (r.garnish ?? []) as GarnishId[],
    isNew: r.is_new,
    isPopular: r.is_popular,
    isFeatured: r.is_featured,
    featuredOrder: r.featured_order,
    visible: r.visible,
    sortOrder: r.sort_order,
    imagePath: r.image_path,
    image: r.image_path ? `${STORAGE_BASE}/${r.image_path}` : null,
    configGroupIds: (r.config_groups ?? []).map((c) => c.group_id),
  };
}

function toAdminCategory(r: DbAdminCategoryRow): AdminCategory {
  return {
    id: r.id,
    slug: r.slug,
    label: r.label,
    tagline: r.tagline,
    sortOrder: r.sort_order,
  };
}

/** Lectura autenticada: incluye comidas ocultas (RLS `*_staff_read_all`). */
export async function fetchAdminMenu(): Promise<{
  products: AdminProduct[];
  categories: AdminCategory[];
  menuConfig: AdminMenuConfig;
}> {
  const sb = getSupabase();
  const [prodRes, catRes, metaRes, groupsRes, itemsRes] = await Promise.all([
    sb
      .from('products')
      .select(PRODUCT_COLS)
      .is('deleted_at', null)
      .order('sort_order'),
    sb
      .from('categories')
      .select('id,slug,label,tagline,sort_order')
      .is('deleted_at', null)
      .order('sort_order'),
    sb
      .from('menu_config_meta')
      .select('heading,option_allergens,no_fries_delta,no_drink_delta')
      .single(),
    sb
      .from('menu_config_groups')
      .select('id,key,heading,style,selection,auto_categories,sort_order')
      .order('sort_order'),
    sb
      .from('menu_config_items')
      .select('id,group_id,title,detail,delta,sort_order')
      .order('sort_order'),
  ]);
  if (prodRes.error) throw friendlyError(prodRes.error);
  if (catRes.error) throw friendlyError(catRes.error);
  if (metaRes.error) throw friendlyError(metaRes.error);
  if (groupsRes.error) throw friendlyError(groupsRes.error);
  if (itemsRes.error) throw friendlyError(itemsRes.error);

  const categories = (catRes.data as DbAdminCategoryRow[]).map(toAdminCategory);
  const order = new Map(categories.map((c) => [c.id, c.sortOrder]));
  const products = (prodRes.data as unknown as DbAdminProductRow[])
    .map(toAdminProduct)
    .sort(
      (a, b) =>
        (order.get(a.categoryId) ?? 1e9) - (order.get(b.categoryId) ?? 1e9) ||
        a.sortOrder - b.sortOrder
    );

  const meta = metaRes.data as {
    heading: string;
    option_allergens: string[] | null;
    no_fries_delta: number | string | null;
    no_drink_delta: number | string | null;
  };
  const allItems = (itemsRes.data as DbMenuConfigItemRow[]).map((r) => ({
    id: r.id,
    groupId: r.group_id,
    title: r.title,
    detail: r.detail,
    delta: num(r.delta),
    sortOrder: r.sort_order,
  }));
  const menuConfig: AdminMenuConfig = {
    heading: meta.heading,
    optionAllergens: (meta.option_allergens ?? []) as AllergenId[],
    noFriesDelta: meta.no_fries_delta != null ? num(meta.no_fries_delta) : -1,
    noDrinkDelta: meta.no_drink_delta != null ? num(meta.no_drink_delta) : -1.5,
    groups: (groupsRes.data as DbMenuConfigGroupRow[]).map((g) => ({
      id: g.id,
      key: g.key,
      heading: g.heading,
      style: g.style,
      selection: g.selection,
      autoCategories: g.auto_categories ?? [],
      sortOrder: g.sort_order,
      items: allItems
        .filter((it) => it.groupId === g.id)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    })),
  };

  return { products, categories, menuConfig };
}

/** Traduce errores de Supabase/Postgres a un mensaje claro en español. */
export function friendlyError(error: unknown): Error {
  const e = (error ?? {}) as { code?: string; message?: string };
  const code = e.code ?? '';
  const msg = (e.message ?? '').toLowerCase();

  if (code === 'P0001' && e.message) {
    // `raise exception` con mensaje propio (ya en español): p. ej. el guardián
    // de borrado de categorías con productos.
    return new Error(e.message);
  }
  if (code === '23505') {
    return new Error('Ese identificador ya está en uso.');
  }
  if (code === '23503') {
    return new Error('La categoría seleccionada ya no existe. Recarga la página.');
  }
  if (code === '23514' || msg.includes('check constraint')) {
    return new Error(
      'Algún dato no cumple las reglas (revisa los precios, las longitudes de texto y los alérgenos).'
    );
  }
  if (code === '42501' || msg.includes('row-level security') || msg.includes('permission denied')) {
    return new Error('No tienes permiso para hacer este cambio.');
  }
  if (code === 'PGRST202' || (msg.includes('function') && msg.includes('not') && msg.includes('found'))) {
    return new Error(
      'Falta aplicar la última migración de la base de datos (ejecuta «supabase db push»).'
    );
  }
  if (code === 'PGRST301' || msg.includes('jwt expired') || msg.includes('token')) {
    return new Error('Tu sesión ha caducado. Vuelve a iniciar sesión.');
  }
  if (msg.includes('mime type') || msg.includes('not supported')) {
    return new Error('Ese formato de imagen no se admite.');
  }
  if (msg.includes('exceeded') || msg.includes('maximum allowed size') || msg.includes('too large')) {
    return new Error('La imagen es demasiado grande.');
  }
  if (msg.includes('failed to fetch') || msg.includes('networkerror') || msg.includes('network')) {
    return new Error('No hay conexión con el servidor. Revisa tu conexión e inténtalo de nuevo.');
  }
  return new Error(
    e.message
      ? `No se pudo completar la operación: ${e.message}`
      : 'No se pudo completar la operación. Inténtalo de nuevo.'
  );
}

/** Crea la comida y devuelve su id. */
export async function createProduct(input: ProductInput): Promise<string> {
  const sb = getSupabase();
  const { count } = await sb
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('category_id', input.category_id)
    .is('deleted_at', null);
  const { data, error } = await sb
    .from('products')
    .insert({ ...input, sort_order: count ?? 0 })
    .select('id')
    .single();
  if (error) throw friendlyError(error);
  return (data as { id: string }).id;
}

export async function updateProduct(
  id: string,
  input: ProductInput
): Promise<void> {
  const { error } = await getSupabase()
    .from('products')
    .update(input)
    .eq('id', id);
  if (error) throw friendlyError(error);
}

export async function setProductVisible(
  id: string,
  visible: boolean
): Promise<void> {
  const { error } = await getSupabase()
    .from('products')
    .update({ visible })
    .eq('id', id);
  if (error) throw friendlyError(error);
}

export async function setProductFeatured(
  id: string,
  isFeatured: boolean,
  featuredOrder: number | null
): Promise<void> {
  // Toda comida en "Nuestros imprescindibles" debe ser popular; al salir de la
  // sección se deja `is_popular` como esté (puede seguir siendo popular).
  const patch = isFeatured
    ? { is_featured: true, featured_order: featuredOrder, is_popular: true }
    : { is_featured: false, featured_order: null };
  const { error } = await getSupabase()
    .from('products')
    .update(patch)
    .eq('id', id);
  if (error) throw friendlyError(error);
}

export async function softDeleteProduct(id: string): Promise<void> {
  const { error } = await getSupabase()
    .from('products')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw friendlyError(error);
}

export async function reorderProducts(
  categoryId: string,
  orderedSlugs: string[]
): Promise<void> {
  const { error } = await getSupabase().rpc('reorder_products', {
    p_category_id: categoryId,
    p_slugs: orderedSlugs,
  });
  if (error) throw friendlyError(error);
}

/** Sube la imagen ya recortada y devuelve la ruta en el bucket. */
export async function uploadProductImage(
  slug: string,
  blob: Blob
): Promise<string> {
  const type = blob.type || 'image/jpeg';
  const ext =
    type === 'image/webp' ? 'webp' : type === 'image/png' ? 'png' : 'jpg';
  const path = `products/${slug}-${Date.now()}.${ext}`;
  const { error } = await getSupabase()
    .storage.from('menu')
    .upload(path, blob, { contentType: type, upsert: true });
  if (error) throw friendlyError(error);
  return path;
}

export async function removeProductImageObject(path: string): Promise<void> {
  const { error } = await getSupabase().storage.from('menu').remove([path]);
  if (error) throw friendlyError(error);
}

export async function setProductImagePath(
  id: string,
  path: string | null
): Promise<void> {
  const { error } = await getSupabase()
    .from('products')
    .update({ image_path: path })
    .eq('id', id);
  if (error) throw friendlyError(error);
}

// ── Categorías ─────────────────────────────────────────────────────────────

export async function createCategory(input: CategoryInput): Promise<void> {
  const sb = getSupabase();
  const { count } = await sb
    .from('categories')
    .select('id', { count: 'exact', head: true })
    .is('deleted_at', null);
  const { error } = await sb
    .from('categories')
    .insert({ ...input, sort_order: count ?? 0 });
  if (error) throw friendlyError(error);
}

export async function updateCategory(
  id: string,
  input: CategoryInput
): Promise<void> {
  const { error } = await getSupabase()
    .from('categories')
    .update(input)
    .eq('id', id);
  if (error) throw friendlyError(error);
}

export async function softDeleteCategory(id: string): Promise<void> {
  const { error } = await getSupabase()
    .from('categories')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw friendlyError(error);
}

export async function reorderCategories(orderedSlugs: string[]): Promise<void> {
  const { error } = await getSupabase().rpc('reorder_categories', {
    p_slugs: orderedSlugs,
  });
  if (error) throw friendlyError(error);
}

// ── "Configura tu Menú" ────────────────────────────────────────────────────

export async function updateMenuConfigMeta(
  heading: string,
  optionAllergens: AllergenId[],
  noFriesDelta: number,
  noDrinkDelta: number
): Promise<void> {
  const { error } = await getSupabase()
    .from('menu_config_meta')
    .update({
      heading,
      option_allergens: optionAllergens,
      no_fries_delta: noFriesDelta,
      no_drink_delta: noDrinkDelta,
    })
    .eq('id', true);
  if (error) throw friendlyError(error);
}

/**
 * Fija los bloques de "Configura tu Menú" que se aplican a una comida.
 * Borra los enlaces actuales y crea los nuevos (operación no atómica: si el
 * insert falla tras el delete, se vuelve a intentar al reguardar la comida).
 */
export async function setProductConfigGroups(
  productId: string,
  groupIds: string[]
): Promise<void> {
  const sb = getSupabase();
  const del = await sb
    .from('product_config_groups')
    .delete()
    .eq('product_id', productId);
  if (del.error) throw friendlyError(del.error);
  if (groupIds.length === 0) return;
  const ins = await sb
    .from('product_config_groups')
    .insert(groupIds.map((group_id) => ({ product_id: productId, group_id })));
  if (ins.error) throw friendlyError(ins.error);
}

export async function createMenuConfigItem(
  input: MenuConfigItemInput
): Promise<void> {
  const sb = getSupabase();
  const { count } = await sb
    .from('menu_config_items')
    .select('id', { count: 'exact', head: true })
    .eq('group_id', input.group_id);
  const { error } = await sb
    .from('menu_config_items')
    .insert({ ...input, sort_order: count ?? 0 });
  if (error) throw friendlyError(error);
}

// ── Bloques de "Configura tu Menú" ────────────────────────────────────────

export async function createMenuGroup(input: MenuGroupInput): Promise<void> {
  const sb = getSupabase();
  const { count } = await sb
    .from('menu_config_groups')
    .select('id', { count: 'exact', head: true });
  const { error } = await sb
    .from('menu_config_groups')
    .insert({ ...input, sort_order: count ?? 0 });
  if (error) throw friendlyError(error);
}

export async function updateMenuGroup(
  id: string,
  input: Pick<
    MenuGroupInput,
    'heading' | 'style' | 'selection' | 'auto_categories'
  >
): Promise<void> {
  const { error } = await getSupabase()
    .from('menu_config_groups')
    .update({
      heading: input.heading,
      style: input.style,
      selection: input.selection,
      auto_categories: input.auto_categories,
    })
    .eq('id', id);
  if (error) throw friendlyError(error);
}

export async function deleteMenuGroup(id: string): Promise<void> {
  const { error } = await getSupabase()
    .from('menu_config_groups')
    .delete()
    .eq('id', id);
  if (error) throw friendlyError(error);
}

export async function reorderMenuGroups(ids: string[]): Promise<void> {
  const sb = getSupabase();
  const results = await Promise.all(
    ids.map((id, i) =>
      sb.from('menu_config_groups').update({ sort_order: i }).eq('id', id)
    )
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) throw friendlyError(failed.error);
}

export async function updateMenuConfigItem(
  id: string,
  input: MenuConfigItemInput
): Promise<void> {
  const { error } = await getSupabase()
    .from('menu_config_items')
    .update({ title: input.title, detail: input.detail, delta: input.delta })
    .eq('id', id);
  if (error) throw friendlyError(error);
}

export async function deleteMenuConfigItem(id: string): Promise<void> {
  const { error } = await getSupabase()
    .from('menu_config_items')
    .delete()
    .eq('id', id);
  if (error) throw friendlyError(error);
}

/** Reordena los ítems de un `kind` (no hay índice único en sort_order). */
export async function reorderMenuConfigItems(
  ids: string[]
): Promise<void> {
  const sb = getSupabase();
  const results = await Promise.all(
    ids.map((id, i) =>
      sb.from('menu_config_items').update({ sort_order: i }).eq('id', id)
    )
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) throw friendlyError(failed.error);
}

// ── Destacados ─────────────────────────────────────────────────────────────

export async function reorderFeatured(ids: string[]): Promise<void> {
  const { error } = await getSupabase().rpc('reorder_featured', {
    p_ids: ids,
  });
  if (error) throw friendlyError(error);
}
