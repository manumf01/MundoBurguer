// @ts-check
/**
 * Genera `src/features/menu/data/menu.snapshot.json`: la copia estática de la
 * carta que el build usa como último recurso si el backend no responde
 * (ver Fase 4).
 *
 *   pnpm gen:snapshot                 # desde la BD (tras `pnpm seed`)
 *   pnpm gen:snapshot -- --from-source  # desde menu.ts (sin imágenes)
 *
 * El modo `--from-source` sirve para tener un snapshot inicial en el repo
 * antes de haber ejecutado el seed. Regénéralo desde la BD en cuanto puedas.
 */
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { createClient } from '@supabase/supabase-js';
import { createServer, loadEnv } from 'vite';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'src/features/menu/data/menu.snapshot.json');
const fromSource = process.argv.includes('--from-source');

const env = loadEnv('development', ROOT, '');

/** Quita las claves `undefined` para que el JSON quede como los datos escritos a mano. */
const clean = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));

async function fromSourceSnapshot() {
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
    logLevel: 'warn',
  });
  try {
    const { CATEGORIES, MENU, FEATURED_IDS } = await vite.ssrLoadModule(
      '/src/features/menu/data/menu.ts'
    );
    const { menuConfig } = await vite.ssrLoadModule(
      '/src/features/menu/data/menuConfig.ts'
    );
    return {
      categories: CATEGORIES.map((c) => clean({ ...c })),
      // Se descarta `image`: apunta a un asset con hash del build, no sirve
      // como URL en tiempo de ejecución. El snapshot desde la BD sí lleva
      // las URLs de Storage. Los destacados se derivan de FEATURED_IDS.
      products: MENU.map(({ image: _image, ...rest }) => {
        const featuredOrder = FEATURED_IDS.indexOf(rest.id);
        return featuredOrder === -1
          ? rest
          : { ...rest, isPopular: true, isFeatured: true, featuredOrder };
      }),
      menuConfig: {
        heading: menuConfig.heading,
        optionAllergens: [...menuConfig.optionAllergens],
        noFriesDelta: menuConfig.noFriesDelta ?? -1,
        noDrinkDelta: menuConfig.noDrinkDelta ?? -1.5,
        comboCategory: menuConfig.comboCategory ?? 'menus',
        groups: menuConfig.groups.map((g) => ({
          key: g.key,
          heading: g.heading,
          style: g.style,
          selection: g.selection,
          autoCategories: [...g.autoCategories],
          items: g.items.map((it) => ({
            title: it.title,
            detail: it.detail,
            delta: it.delta,
          })),
        })),
      },
    };
  } finally {
    await vite.close();
  }
}

async function fromDbSnapshot() {
  const url = env.VITE_SUPABASE_URL;
  const key = env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.error(
      '✗ Faltan VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY en .env.local\n' +
        '  (o usa: pnpm gen:snapshot -- --from-source)'
    );
    process.exit(1);
  }
  const supabase = createClient(url, key, {
    auth: { persistSession: false },
  });

  const cats = await supabase
    .from('categories')
    .select('slug,label,tagline,sort_order')
    .is('deleted_at', null);
  const prods = await supabase
    .from('products')
    .select(
      'slug,name,description,price,price_note,variants,tiers,allergens,garnish,' +
        'is_new,is_popular,is_featured,featured_order,image_path,sort_order,' +
        'category:categories(slug),' +
        'config_groups:product_config_groups(group:menu_config_groups(key))'
    )
    .is('deleted_at', null)
    .eq('visible', true);
  const meta = await supabase
    .from('menu_config_meta')
    .select(
      'heading,option_allergens,no_fries_delta,no_drink_delta,combo_category_slug'
    )
    .single();
  const groups = await supabase
    .from('menu_config_groups')
    .select('id,key,heading,style,selection,auto_categories,sort_order')
    .order('sort_order');
  const items = await supabase
    .from('menu_config_items')
    .select('group_id,title,detail,delta,sort_order');

  for (const [label, res] of [
    ['categories', cats],
    ['products', prods],
    ['menu_config_meta', meta],
    ['menu_config_groups', groups],
    ['menu_config_items', items],
  ]) {
    if (res.error) {
      console.error(`✗ leer ${label}:`, res.error.message);
      process.exit(1);
    }
  }

  const catOrder = new Map(cats.data.map((c) => [c.slug, c.sort_order]));
  const num = (v) => (v === null || v === undefined ? undefined : Number(v));

  const categories = [...cats.data]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((c) =>
      clean({
        id: c.slug,
        label: c.label,
        tagline: c.tagline ?? '',
        priceHeader: c.price_header ?? undefined,
      })
    );

  const products = [...prods.data]
    .sort(
      (a, b) =>
        (catOrder.get(a.category?.slug) ?? 0) -
          (catOrder.get(b.category?.slug) ?? 0) || a.sort_order - b.sort_order
    )
    .map((p) =>
      clean({
        id: p.slug,
        name: p.name,
        description: p.description ?? undefined,
        category: p.category?.slug,
        price: num(p.price),
        priceNote: p.price_note ?? undefined,
        variants: p.variants?.length
          ? p.variants.map((v) => ({ label: v.label, price: Number(v.price) }))
          : undefined,
        tiers: p.tiers?.length
          ? p.tiers.map((t) => ({
              pieces: Number(t.pieces),
              price: Number(t.price),
            }))
          : undefined,
        allergens: p.allergens ?? [],
        garnish: p.garnish?.length ? p.garnish : undefined,
        isNew: p.is_new || undefined,
        isPopular: p.is_popular || undefined,
        isFeatured: p.is_featured || undefined,
        featuredOrder: p.is_featured ? (p.featured_order ?? undefined) : undefined,
        image: p.image_path
          ? `${url}/storage/v1/object/public/menu/${p.image_path}`
          : undefined,
        configGroupKeys: p.config_groups?.length
          ? p.config_groups.map((c) => c.group?.key).filter(Boolean)
          : undefined,
      })
    );

  return {
    categories,
    products,
    menuConfig: {
      heading: meta.data.heading,
      optionAllergens: meta.data.option_allergens ?? [],
      noFriesDelta: num(meta.data.no_fries_delta) ?? -1,
      noDrinkDelta: num(meta.data.no_drink_delta) ?? -1.5,
      comboCategory: meta.data.combo_category_slug ?? 'menus',
      groups: [...groups.data]
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((g) => ({
          key: g.key,
          heading: g.heading,
          style: g.style,
          selection: g.selection,
          autoCategories: g.auto_categories ?? [],
          items: items.data
            .filter((i) => i.group_id === g.id)
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((i) => ({
              title: i.title,
              detail: i.detail,
              delta: Number(i.delta),
            })),
        })),
    },
  };
}

async function main() {
  const body = fromSource
    ? await fromSourceSnapshot()
    : await fromDbSnapshot();

  const snapshot = { generatedAt: new Date().toISOString(), ...body };
  await writeFile(OUT, JSON.stringify(snapshot, null, 2) + '\n', 'utf8');

  console.log(
    `✓ ${path.relative(ROOT, OUT)} — ${snapshot.categories.length} categorías, ` +
      `${snapshot.products.length} productos` +
      (fromSource ? ' (desde menu.ts, sin imágenes)' : '')
  );

  // Mantiene public/sitemap.xml en sync con la carta.
  const { generateSitemap } = await import('./gen-sitemap.mjs');
  await generateSitemap();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
