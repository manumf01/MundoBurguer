import { describe, it, expect } from 'vitest';
import headersFile from '../../public/_headers?raw';
import vercel from '../../vercel.json';

/** Cabeceras del bloque `/*` de public/_headers, como mapa nombre -> valor. */
function parseNetlifyHeaders(txt: string): Record<string, string> {
  const out: Record<string, string> = {};
  let inGlob = false;
  for (const raw of txt.split('\n')) {
    const line = raw.replace(/\r$/, '');
    if (/^\S/.test(line)) {
      inGlob = line.trim() === '/*';
      continue;
    }
    if (!inGlob) continue;
    const m = line.match(/^\s{2}([A-Za-z-]+):\s?(.*)$/);
    if (m && m[1]) out[m[1]] = m[2] ?? '';
  }
  return out;
}

const netlify = parseNetlifyHeaders(headersFile);
const vercelHeaders = Object.fromEntries(
  (vercel.headers?.[0]?.headers ?? []).map((h) => [h.key, h.value])
);

const REQUIRED = [
  'Content-Security-Policy',
  'Strict-Transport-Security',
  'X-Frame-Options',
  'X-Content-Type-Options',
  'Referrer-Policy',
  'Permissions-Policy',
];

describe('cabeceras de seguridad', () => {
  it('vercel.json conserva el fallback SPA', () => {
    expect(vercel.rewrites).toEqual([
      { source: '/(.*)', destination: '/index.html' },
    ]);
  });

  it('_headers y vercel.json aplican las mismas cabeceras a todo', () => {
    for (const name of REQUIRED) {
      expect(netlify[name], `_headers sin ${name}`).toBeTruthy();
      expect(vercelHeaders[name], `vercel.json sin ${name}`).toBeTruthy();
      expect(netlify[name], `${name} difiere entre ficheros`).toBe(
        vercelHeaders[name]
      );
    }
  });

  it('la CSP es estricta con los scripts', () => {
    const csp = netlify['Content-Security-Policy'] ?? '';
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("base-uri 'self'");
    const scriptSrc = csp
      .split(';')
      .find((d) => d.trim().startsWith('script-src'));
    expect(scriptSrc).toBeTruthy();
    expect(scriptSrc).not.toContain("'unsafe-inline'");
    expect(scriptSrc).not.toContain("'unsafe-eval'");
  });

  it('la CSP permite lo que la app necesita', () => {
    const csp = netlify['Content-Security-Policy'] ?? '';
    expect(csp).toContain('https://*.supabase.co');
    expect(csp).toContain('wss://*.supabase.co');
    expect(csp).toContain('https://www.google.com'); // mapa embebido
    expect(csp).toContain('https://www.googletagmanager.com'); // GA
  });
});
