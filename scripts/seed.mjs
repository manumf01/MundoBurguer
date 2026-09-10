// @ts-check
/**
 * Seed inicial de la carta a Supabase.
 *
 *   pnpm seed
 *
 * Lee `src/features/menu/data/{menu,menuConfig,seedMapping}.ts` (vía Vite SSR,
 * para resolver los imports de imágenes `@/assets/...`), vuelca categorías,
 * productos y el bloque "Configura tu Menú" a la BD, y sube las imágenes
 * actuales al bucket `menu`.
 *
 * Es IMPORT, no sync: es idempotente (upsert por `slug`) pero NO borra filas
 * que ya no estén en `menu.ts`.
 *
 * Requiere en `.env.local`:
 *   VITE_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY   (solo local; nunca en el repo ni en Vercel)
 */
import { existsSync } from 'node:fs';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { createClient } from '@supabase/supabase-js';
import { createServer, loadEnv } from 'vite';

const ROOT = process.cwd();
const ASSETS_DIR = path.join(ROOT, 'src/assets/menu');
const BUCKET = 'menu';

const env = loadEnv('development', ROOT, '');
const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error(
    '✗ Faltan VITE_SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY en .env.local'
  );
  process.exit(1);
}
if (decodeJwtRole(SERVICE_KEY) !== 'service_role') {
  console.error(
    '✗ SUPABASE_SERVICE_ROLE_KEY no parece la clave service_role (¿pegaste la anon?)'
  );
  process.exit(1);
}

/** @param {string} jwt */
function decodeJwtRole(jwt) {
  try {
    const payload = JSON.parse(
      Buffer.from(jwt.split('.')[1], 'base64').toString('utf8')
    );
    return payload.role;
  } catch {
    return null;
  }
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

/** @param {import('@supabase/supabase-js').PostgrestError | null} error */
function assertOk(error, context) {
  if (error) {
    console.error(`✗ ${context}:`, error.message);
    process.exit(1);
  }
}

async function main() {
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
    logLevel: 'warn',
  });

  try {
    const menuMod = await vite.ssrLoadModule('/src/features/menu/data/menu.ts');
    const cfgMod = await vite.ssrLoadModule(
      '/src/features/menu/data/menuConfig.ts'
    );
    const map = await vite.ssrLoadModule(
      '/src/features/menu/data/seedMapping.ts'
    );

    const { CATEGORIES, MENU, FEATURED_IDS } = menuMod;
    const { menuConfig } = cfgMod;

    // ── Categorías ────────────────────────────────────────────────────────
    const categoryRows = map.toCategoryRows(CATEGORIES);
    const { data: cats, error: catErr } = await supabase
      .from('categories')
      .upsert(categoryRows, { onConflict: 'slug' })
      .select('id, slug');
    assertOk(catErr, 'upsert categories');
    const idBySlug = new Map(cats.map((c) => [c.slug, c.id]));
    console.log(`✓ categorías: ${cats.length}`);

    // ── Productos ─────────────────────────────────────────────────────────
    const productRows = map
      .toProductRows(MENU, FEATURED_IDS)
      .map(({ category_slug, ...rest }) => {
        const category_id = idBySlug.get(category_slug);
        if (!category_id) {
          console.error(`✗ categoría desconocida: ${category_slug}`);
          process.exit(1);
        }
        return { ...rest, category_id };
      });

    // Limpia el estado de destacados ANTES del upsert: si en el panel se ha
    // cambiado qué comidas están en "Nuestros imprescindibles", los
    // featured_order de la BD chocarían con los que fija el seed (índice
    // parcial único products_featured_order_idx). El seed es autoritativo:
    // deja como destacadas solo las de menu.ts / FEATURED_IDS.
    const { error: clearErr } = await supabase
      .from('products')
      .update({ is_featured: false, featured_order: null })
      .not('id', 'is', null);
    assertOk(clearErr, 'limpiar destacados antes del upsert');

    const { error: prodErr } = await supabase
      .from('products')
      .upsert(productRows, { onConflict: 'slug' });
    assertOk(prodErr, 'upsert products');
    console.log(`✓ productos: ${productRows.length}`);

    // ── "Configura tu Menú" ──────────────────────────────────────────────
    const { error: metaErr } = await supabase
      .from('menu_config_meta')
      .update({
        heading: menuConfig.heading,
        option_allergens: [...menuConfig.optionAllergens],
        no_fries_delta: menuConfig.noFriesDelta ?? -1,
        no_drink_delta: menuConfig.noDrinkDelta ?? -1.5,
        combo_category_slug: menuConfig.comboCategory ?? 'menus',
      })
      .eq('id', true);
    assertOk(metaErr, 'update menu_config_meta');

    // Borrar ítems primero (FK), luego grupos.
    const { error: delItemsErr } = await supabase
      .from('menu_config_items')
      .delete()
      .not('id', 'is', null);
    assertOk(delItemsErr, 'limpiar menu_config_items');
    const { error: delGroupsErr } = await supabase
      .from('menu_config_groups')
      .delete()
      .not('id', 'is', null);
    assertOk(delGroupsErr, 'limpiar menu_config_groups');

    const cfg = map.toMenuConfigRows(
      menuConfig.groups.map((g) => ({
        key: g.key,
        heading: g.heading,
        style: g.style,
        selection: g.selection,
        autoCategories: [...g.autoCategories],
        items: g.items.map((it) => ({ ...it })),
      }))
    );
    const { data: groupRows, error: insGroupsErr } = await supabase
      .from('menu_config_groups')
      .insert(cfg.groups)
      .select('id, key');
    assertOk(insGroupsErr, 'insert menu_config_groups');
    const groupIdByKey = new Map(groupRows.map((g) => [g.key, g.id]));

    const itemRows = cfg.items.map(({ group_key, ...rest }) => ({
      ...rest,
      group_id: groupIdByKey.get(group_key),
    }));
    const { error: insItemsErr } = await supabase
      .from('menu_config_items')
      .insert(itemRows);
    assertOk(insItemsErr, 'insert menu_config_items');
    console.log(
      `✓ menú configurable: ${cfg.groups.length} bloques, ${itemRows.length} ítems`
    );

    // ── Imágenes ─────────────────────────────────────────────────────────
    const diskFiles = await readdir(ASSETS_DIR);
    let uploaded = 0;
    let missing = 0;

    for (const p of MENU) {
      if (!p.image) continue;
      const file = resolveAsset(String(p.image), diskFiles);
      if (!file) {
        console.warn(`  ! sin fichero para ${p.id} (${p.image})`);
        missing += 1;
        continue;
      }
      const body = await readFile(path.join(ASSETS_DIR, file));
      const objectPath = `products/${p.id}.webp`;
      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(objectPath, body, {
          contentType: 'image/webp',
          upsert: true,
        });
      if (upErr) {
        console.error(`✗ subir ${objectPath}:`, upErr.message);
        process.exit(1);
      }
      const { error: pathErr } = await supabase
        .from('products')
        .update({ image_path: objectPath })
        .eq('slug', p.id);
      assertOk(pathErr, `image_path de ${p.id}`);
      uploaded += 1;
    }
    console.log(
      `✓ imágenes: ${uploaded} subidas${missing ? `, ${missing} sin fichero` : ''}`
    );

    // ── Limpieza del ruido de auditoría del seed ─────────────────────────
    // Las filas sin actor son siempre escrituras de sistema (seed, SQL
    // manual); una acción real desde el panel siempre lleva actor_id.
    const { error: auditErr } = await supabase
      .from('audit_log')
      .delete()
      .is('actor_id', null);
    assertOk(auditErr, 'limpiar audit_log del seed');

    console.log('\n✔ Seed completado. Genera el snapshot con: pnpm gen:snapshot');
  } finally {
    await vite.close();
  }
}

/**
 * De la URL que devuelve Vite para un asset (`/src/assets/menu/foo.webp`,
 * o `foo-1a2b3c4d.webp` en build) al nombre real del fichero en disco.
 * @param {string} url
 * @param {string[]} diskFiles
 */
function resolveAsset(url, diskFiles) {
  const base = path.basename(url.split('?')[0]);
  if (existsSync(path.join(ASSETS_DIR, base))) return base;
  const dehashed = base.replace(/-[A-Za-z0-9_-]{6,}(\.\w+)$/, '$1');
  if (existsSync(path.join(ASSETS_DIR, dehashed))) return dehashed;
  const stem = dehashed.replace(/\.\w+$/, '');
  return diskFiles.find((f) => f.startsWith(stem)) ?? null;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
