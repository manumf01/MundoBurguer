# Despliegue

La web es un **build estático de Vite** (`pnpm build` → carpeta `dist/`). Se
puede servir tal cual desde cualquier hosting de estáticos (Vercel, Netlify,
Cloudflare Pages, un nginx…). No hay APIs propias del hosting: el backend
(Supabase) es independiente.

```
pnpm install
pnpm build          # genera dist/
# sube dist/ a tu hosting, o conéctalo al repo
```

## Variables de entorno

Todas las `VITE_*` son **públicas** (viajan en el bundle del navegador). La
seguridad de los datos la aplican las políticas RLS de Postgres, no el secreto.

| Variable                 | Para qué                                                 |
| ------------------------ | -------------------------------------------------------- |
| `VITE_SUPABASE_URL`      | URL del proyecto Supabase (`https://<ref>.supabase.co`). |
| `VITE_SUPABASE_ANON_KEY` | Clave anónima de Supabase.                               |
| `VITE_SITE_URL`          | URL pública del sitio (canonical, Open Graph, sitemap).  |
| `VITE_GA_MEASUREMENT_ID` | ID de Google Analytics 4. Vacía = sin analítica.         |

`SUPABASE_SERVICE_ROLE_KEY` **nunca** se despliega: es solo para `pnpm seed`
desde tu máquina (`.env.local`, git-ignored).

## Enrutado SPA (history fallback)

Al ser una SPA con React Router, cualquier ruta desconocida debe servir
`index.html`:

- **Vercel** — `vercel.json` → `rewrites` (ya incluido).
- **Netlify** — `public/_redirects` con `/* /index.html 200`, o el ajuste
  "Single Page Application" del panel.
- **Cloudflare Pages** — lo hace automáticamente para SPAs; si no, añade
  `public/_redirects` igual que Netlify.
- **nginx** — `try_files $uri /index.html;` (ver más abajo).

## Cabeceras de seguridad

Se definen **por hosting** (no en el código de la app, para no atarla a
ninguno):

| Hosting                   | Fichero                                     |
| ------------------------- | ------------------------------------------- |
| Netlify, Cloudflare Pages | `public/_headers`                           |
| Vercel                    | `vercel.json` → `headers`                   |
| nginx / Apache            | snippet de abajo (documentado, no incluido) |

Las cabeceras que se aplican a **todas** las respuestas:

- `Content-Security-Policy` — ver desglose abajo.
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
  (HSTS 1 año; se puede añadir `; preload` y registrarlo en
  <https://hstspreload.org> cuando el dominio definitivo esté estable).
- `X-Frame-Options: DENY` (+ `frame-ancestors 'none'` en la CSP).
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: geolocation=(), camera=(), microphone=(), payment=(), usb=()`

> Si tocas la CSP, cámbiala **en los dos** ficheros (`_headers` y `vercel.json`).
> El test `src/test/security-headers.test.ts` falla si divergen.

### La CSP, directiva a directiva

| Directiva                   | Valor                                                                                                                                             | Por qué                                                                                                    |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `default-src`               | `'self'`                                                                                                                                          | Todo lo no listado, solo del propio origen.                                                                |
| `script-src`                | `'self' https://www.googletagmanager.com`                                                                                                         | Bundle propio + gtag.js (solo si se acepta la cookie de análisis). Sin `unsafe-inline` ni `unsafe-eval`.   |
| `style-src`                 | `'self' 'unsafe-inline'`                                                                                                                          | CSS propio + estilos en línea que React/framer-motion/@dnd-kit ponen en atributos `style`.                 |
| `img-src`                   | `'self' data: https://*.supabase.co https://*.googleusercontent.com https://www.googletagmanager.com https://*.google-analytics.com`              | Imágenes propias, `data:` (iconos), fotos de producto (Supabase Storage), avatar de Google, píxeles de GA. |
| `font-src`                  | `'self'`                                                                                                                                          | Fuentes autoalojadas en `/fonts`.                                                                          |
| `connect-src`               | `'self' https://*.supabase.co wss://*.supabase.co https://www.googletagmanager.com https://*.google-analytics.com https://*.analytics.google.com` | PostgREST + Auth + Realtime de Supabase, y GA.                                                             |
| `frame-src`                 | `https://www.google.com`                                                                                                                          | El mapa embebido de Google Maps.                                                                           |
| `frame-ancestors`           | `'none'`                                                                                                                                          | Nadie puede meter la web en un iframe.                                                                     |
| `base-uri`                  | `'self'`                                                                                                                                          | Evita secuestro de `<base>`.                                                                               |
| `object-src`                | `'none'`                                                                                                                                          | Sin plugins/`<object>`.                                                                                    |
| `form-action`               | `'self'`                                                                                                                                          | Los formularios solo envían al propio origen.                                                              |
| `worker-src`                | `'self'`                                                                                                                                          | Workers solo propios.                                                                                      |
| `upgrade-insecure-requests` | —                                                                                                                                                 | Fuerza HTTPS en subrecursos.                                                                               |

El comodín `https://*.supabase.co` cubre cualquier proyecto Supabase, así que
**no hay que editar la CSP al cambiar de proyecto**. Solo hay que tocarla si se
añade otro servicio externo (otro CDN, otro embed…).

### nginx (para self-host; no incluido en el repo)

```nginx
server {
  listen 443 ssl http2;
  server_name mundoburguer.com;
  root /var/www/mundoburguer/dist;

  # SPA
  location / {
    try_files $uri /index.html;
  }

  # Estáticos con hash: caché larga
  location /assets/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }

  add_header Content-Security-Policy "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; frame-src https://www.google.com; img-src 'self' data: https://*.supabase.co https://*.googleusercontent.com https://www.googletagmanager.com https://*.google-analytics.com; font-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' https://www.googletagmanager.com; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://www.googletagmanager.com https://*.google-analytics.com https://*.analytics.google.com; worker-src 'self'; form-action 'self'; upgrade-insecure-requests" always;
  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
  add_header X-Frame-Options "DENY" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header Referrer-Policy "strict-origin-when-cross-origin" always;
  add_header Permissions-Policy "geolocation=(), camera=(), microphone=(), payment=(), usb=()" always;
}
```

Apache: lo mismo con `Header always set …` dentro de `<IfModule mod_headers.c>`
y `FallbackResource /index.html` para la SPA.

## Cloudflare por delante (documentado, no implementado)

Si algún día se pone Cloudflare como proxy (naranja) delante del hosting:

- Deja que las cabeceras del origen pasen tal cual (Cloudflare no las quita), o
  replícalas con una **Transform Rule → HTTP Response Header Modification**.
- Activa "Always Use HTTPS" y "Automatic HTTPS Rewrites".
- No hace falta tocar el código de la app.

## robots.txt / sitemap

- `public/robots.txt` — permite todo salvo `/acceso` y `/panel`.
- `public/sitemap.xml` — se regenera con `pnpm gen:sitemap` (o
  `pnpm gen:snapshot`, que lo hace al final). Incluye una URL por producto.
