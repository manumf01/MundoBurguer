// @ts-check
/**
 * Genera `public/sitemap.xml`: páginas fijas + una URL por producto de la carta
 * (`/carta/<slug>`), tomadas de `menu.snapshot.json`.
 *
 *   pnpm gen:sitemap
 *
 * `pnpm gen:snapshot` lo llama al final para mantener ambos en sync.
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const SNAPSHOT = path.join(ROOT, 'src/features/menu/data/menu.snapshot.json');
const OUT = path.join(ROOT, 'public/sitemap.xml');

const BASE = (
  process.env.VITE_SITE_URL ?? 'https://www.mundoburguer.es'
).replace(/\/$/, '');

/** Páginas fijas indexables (las rutas privadas quedan fuera a propósito). */
const STATIC_PAGES = [
  { path: '/', changefreq: 'monthly', priority: '1.0' },
  { path: '/carta', changefreq: 'weekly', priority: '0.9' },
  { path: '/sobre-nosotros', changefreq: 'yearly', priority: '0.6' },
  { path: '/contacto', changefreq: 'yearly', priority: '0.7' },
];

const xmlEscape = (s) =>
  s.replace(/[<>&'"]/g, (c) =>
    c === '<'
      ? '&lt;'
      : c === '>'
        ? '&gt;'
        : c === '&'
          ? '&amp;'
          : c === "'"
            ? '&apos;'
            : '&quot;'
  );

function urlEntry(loc, changefreq, priority) {
  return (
    `  <url>\n` +
    `    <loc>${xmlEscape(loc)}</loc>\n` +
    `    <changefreq>${changefreq}</changefreq>\n` +
    `    <priority>${priority}</priority>\n` +
    `  </url>`
  );
}

export async function generateSitemap() {
  const snapshot = JSON.parse(await readFile(SNAPSHOT, 'utf8'));
  const products = Array.isArray(snapshot.products) ? snapshot.products : [];

  const entries = [
    ...STATIC_PAGES.map((p) =>
      urlEntry(`${BASE}${p.path}`, p.changefreq, p.priority)
    ),
    ...products
      .map((p) => p.id)
      .filter(Boolean)
      .sort()
      .map((slug) => urlEntry(`${BASE}/carta/${slug}`, 'weekly', '0.7')),
  ];

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    entries.join('\n') +
    `\n</urlset>\n`;

  await writeFile(OUT, xml, 'utf8');
  console.log(
    `✓ ${path.relative(ROOT, OUT)} — ${STATIC_PAGES.length} páginas fijas + ` +
      `${products.length} productos`
  );
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  generateSitemap().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
