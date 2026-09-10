# Mundo Burguer

Web informativa del restaurante **Mundo Burguer** (Moriles, Córdoba).
Muestra la carta completa, la información del local y cómo contactar. No hay
pedidos online ni reservas todavía: la arquitectura queda preparada para
añadirlos (ver `src/config/features.ts` y `src/services/README.md`).

## Stack

- **React 19** + **TypeScript** (modo estricto) + **Vite 8**
- **React Router 7** (data router, rutas lazy)
- **Tailwind CSS v4** (`@theme` con los tokens de la carta) + **Radix UI** +
  **Framer Motion** + **lucide-react**
- **Vitest** + Testing Library
- **ESLint** (flat config) + **Prettier**

## Scripts

| Comando                       | Descripción                                      |
| ----------------------------- | ------------------------------------------------ |
| `pnpm dev`                    | Servidor de desarrollo (`http://localhost:5173`) |
| `pnpm build`                  | `tsc -b` + build de producción                   |
| `pnpm preview`                | Sirve la build                                   |
| `pnpm typecheck`              | Chequeo de tipos                                 |
| `pnpm lint` / `pnpm lint:fix` | ESLint                                           |
| `pnpm format`                 | Prettier                                         |
| `pnpm test` / `pnpm test:run` | Tests                                            |
| `pnpm gen:snapshot`           | Regenera `menu.snapshot.json` + `sitemap.xml`    |

## Despliegue

Build estático deployable a cualquier hosting (Vercel, Netlify, Cloudflare
Pages, nginx…). Las cabeceras de seguridad (CSP, HSTS, X-Frame-Options…) van
en `vercel.json` / `public/_headers` según el hosting. Detalles y snippet de
nginx en **[`DEPLOY.md`](./DEPLOY.md)**.

## Estructura

```
src/
  app/         Shell: App, providers, router (rutas públicas + /acceso + /panel lazy)
  config/      site.ts (datos del negocio), navigation.ts, features.ts
  lib/         cn, format, seo (Seo + JSON-LD), supabase.ts (cliente lazy)
  components/  ui/ (design system), layout/, common/
  features/    menu/ home/ about/ contact/  +  auth/ (sesión + guardas)  admin/ (API + UI del panel)
  pages/       HomePage, MenuPage, ProductDetailPage, AboutPage, ContactPage,
               AccesoPage, panel/ (Carta, Categorías, Configura tu menú,
               Destacados, Solicitudes, Accesos), NotFoundPage
  services/    http.ts (sin uso hoy; punto de extensión para el backend)
  styles/      index.css (Tailwind + tokens)
  assets/brand/ slogan.png, logo.png (provisional — ver su README)
```

Fuente de verdad del negocio: **`src/config/site.ts`**.

**La carta** la sirve el backend (Supabase). En tiempo de ejecución la app la
lee con `src/features/menu/data/menuStore.ts` (_stale-while-revalidate_, en
memoria + `localStorage`): pinta al instante lo último que tenga y **revalida
contra el backend en cada carga de página**, con dedupe de 20 s dentro de la
misma sesión para no repetir peticiones al navegar. Un cambio en el panel se ve
recargando **una vez** (o al instante en una pestaña nueva). Si el backend no
responde, cae al snapshot `src/features/menu/data/menu.snapshot.json` incluido
en el build. `src/features/menu/data/menu.ts` + `menuConfig.ts` (transcritos a mano de la
carta oficial) ya **no** se consumen en runtime: son el origen del seed y del
snapshot `--from-source`.

## Parte privada de administración (Supabase)

Zona privada en **`/panel`** para gestionar la carta sin tocar código ni
volver a desplegar. Backend: **Supabase** (PostgreSQL + Auth con Google +
Storage + RLS), **independiente** del hosting del frontend. Se activa con
`features.adminPanel` en `src/config/features.ts`; en `false` no se monta
ninguna ruta ni enlace del panel y la web pública se comporta igual.

### Qué se puede hacer

| Sección                       | Para qué                                                                                                                                                                                                                            |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Carta**                     | Alta/edición/borrado de comidas (precio único / variantes / tramos, nota, alérgenos, guarnición, sellos Nuevo/Popular, visible), imagen con recorte 16:10, y reordenar por categoría (vista previa arrastrable, guardado diferido). |
| **Categorías**                | Crear/editar/borrar/reordenar categorías.                                                                                                                                                                                           |
| **Configura tu Menú**         | Bloques de opciones (`informativo` / `elegir una` / `elegir varias`), sus ítems con coste **±**, qué categorías aplican un bloque en automático, y los descuentos "sin patatas / sin bebida" de los menús.                          |
| **Destacados**                | Los 4 de "Nuestros imprescindibles" de la portada (arrastrar para ordenar, sustituir).                                                                                                                                              |
| **Solicitudes** _(admin)_     | Aprobar/denegar quién pide entrar, y asignarle rol.                                                                                                                                                                                 |
| **Accesos y roles** _(admin)_ | Todas las cuentas: cambiar rol, revocar acceso, última desconexión.                                                                                                                                                                 |

Cada comida tiene además una **vista de detalle pública** (`/carta/<slug>`,
indexable) con un **configurador**: el cliente elige opciones y ve el precio
final en vivo (solo informativo, sin carrito).

### Acceso, roles y sesión

- **Login solo con Google** (OAuth, flujo de redirección). No hay
  email/contraseña. Punto de entrada discreto: un candado tenue en el footer →
  `/acceso` (ambas rutas en `noindex` y `Disallow` en `robots.txt`).
- Cualquier cuenta puede iniciar sesión; entra como **`pending`** y ve un aviso
  ("el administrador decidirá…"). El admin la aprueba en _Solicitudes_.
- Roles: **`admin`** (todo, + gestión de accesos) y **`editor`** (solo la
  carta). Bootstrap: [EMAIL_ADDRESS]` como admin
(`supabase/migrations/…_bootstrap_admin.sql`).
- La autorización **real** la aplican las políticas **RLS** de Postgres en cada
  consulta, no la UI. Salvaguardas: no puedes cambiarte a ti mismo el
  acceso/rol y siempre debe quedar ≥1 admin.
- **Cierre por inactividad:** 15 min sin usar el panel → cierre de sesión
  automático (`src/features/auth/AuthProvider.tsx`).

### Variables de entorno

| Variable                    | ¿Pública?    | Dónde                               | Para qué                                                     |
| --------------------------- | ------------ | ----------------------------------- | ------------------------------------------------------------ |
| `VITE_SUPABASE_URL`         | Sí (`VITE_`) | `.env.local` + Vercel               | URL del proyecto Supabase                                    |
| `VITE_SUPABASE_ANON_KEY`    | Sí (`VITE_`) | `.env.local` + Vercel               | Clave anónima; la seguridad la aplica RLS, no el secreto     |
| `SUPABASE_SERVICE_ROLE_KEY` | **No**       | **solo** `.env.local` (git-ignored) | Seed inicial desde tu máquina. Nunca en el repo ni en Vercel |

Sin `VITE_SUPABASE_*` la web pública funciona igualmente: la carta cae a su
snapshot estático y `/panel` queda inaccesible.

### Alta del proyecto (guía completa)

> Pasos para dejar el backend funcionando desde cero. Modelo de amenazas en
> [`SECURITY.md`](./SECURITY.md); acceso con cliente de escritorio (DBeaver)
> más abajo. **Por qué Google solo necesita el callback de Supabase:** con el
> flujo `signInWithOAuth`, Google redirige el navegador a Supabase
> (`https://<REF>.supabase.co/auth/v1/callback`), y es **Supabase** quien luego
> redirige a tu app. Por eso las URLs de tu app (localhost, dominio de pruebas,
> dominio final) van en la allowlist de **Supabase**, no en Google. Al comprar
> el dominio real solo se toca Supabase.

**1. Crear el proyecto en Supabase**

1. [supabase.com](https://supabase.com) → _New project_.
2. Region: **EU (Frankfurt) · `eu-central-1`**. Elige una contraseña de base de
   datos fuerte y guárdala (la necesitarás para DBeaver).
3. Cuando termine de aprovisionar, en _Project Settings → API_ apunta:
   - **Project URL** → `https://<REF>.supabase.co` (es tu `VITE_SUPABASE_URL`).
   - **Project API keys → `anon` `public`** → es tu `VITE_SUPABASE_ANON_KEY`.
   - **`service_role` `secret`** → solo para el seed local (paso 8). No la
     pegues en Vercel ni en el repo.
   - El **Project Ref** es el `<REF>` del subdominio (también en
     _Project Settings → General_).

**2. Crear el proyecto en Google Cloud Console**

4. [console.cloud.google.com](https://console.cloud.google.com) → selector de
   proyecto → _Nuevo proyecto_ → nombre `Mundo Burguer` → _Crear_.

**3. Configurar la pantalla de consentimiento de OAuth**

5. Menú → _APIs y servicios → Pantalla de consentimiento de OAuth_.
6. _User type_: **External** → _Crear_.
7. Rellena solo lo obligatorio:
   - _App name_: `Mundo Burguer`
   - _User support email_: tu correo
   - _Developer contact information_: tu correo
   - Deja **vacíos** los enlaces opcionales de _App domain_ (home, privacidad,
     condiciones): así se evita el problema de "dominio autorizado" con
     `vercel.app`. Se rellenan cuando exista `mundoburguer.com`.
8. _Guardar y continuar_ en _Scopes_ (no añadas ninguno) y en _Test users_.
9. Vuelve al resumen y pulsa **Publicar aplicación** → _Confirmar_. Con los
   scopes básicos (`email`, `profile`, `openid`) pasa a "En producción" sin
   verificación de Google.

**4. Crear las credenciales OAuth**

10. _APIs y servicios → Credenciales → Crear credenciales → ID de cliente de
    OAuth_.
11. _Tipo de aplicación_: **Aplicación web**. Nombre: `Supabase Auth`.
12. _Orígenes autorizados de JavaScript_: **déjalo vacío** (no hace falta en el
    flujo de redirección).
13. _URIs de redirección autorizados_ → _Añadir URI_ → pega **exactamente**:
    ```
    https://<REF>.supabase.co/auth/v1/callback
    ```
    (sustituye `<REF>` por tu Project Ref). Es el **único** URI que va aquí.
14. _Crear_. Copia el **Client ID** y el **Client secret**.

**5. Conectar Google con Supabase**

15. Supabase → _Authentication → Sign In / Providers → Google_ → _Enable_.
16. Pega **Client ID** y **Client Secret** → _Save_.

**6. Configurar las URLs de Supabase Auth**

17. Supabase → _Authentication → URL Configuration_:
    - **Site URL**: `https://mundo-burguer.vercel.app`
    - **Redirect URLs** (_Add URL_ por cada una):
      - `http://localhost:5173/**`
      - `https://mundo-burguer.vercel.app/**`
    - Cuando exista el dominio final, añade aquí (y solo aquí):
      `https://mundoburguer.com/**` y `https://www.mundoburguer.com/**`.

**7. Variables de entorno**

18. Crea `.env.local` en la raíz (ya está en `.gitignore`) con:
    ```
    VITE_SUPABASE_URL=https://<REF>.supabase.co
    VITE_SUPABASE_ANON_KEY=<anon key>
    SUPABASE_SERVICE_ROLE_KEY=<service_role key>   # solo local, para el seed
    ```
19. En Vercel → _Settings → Environment Variables_ añade **solo**
    `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` (Production + Preview +
    Development). **No** añadas `SUPABASE_SERVICE_ROLE_KEY`.

**8. Migraciones**

20. Ejecuta las migraciones SQL: ver [`supabase/README.md`](supabase/README.md).

**9. Seed inicial de la carta**

21. Con `.env.local` completo (incluida `SUPABASE_SERVICE_ROLE_KEY`), vuelca
    la carta actual (`src/features/menu/data/`) a la BD y sube las imágenes:
    ```cmd
    pnpm seed
    ```
    Es idempotente (upsert por `slug`): puedes relanzarlo. Es **import, no
    sync**: no borra de la BD lo que quites de `menu.ts`.
22. Regenera el snapshot de respaldo desde la BD (ya con las URLs de las
    imágenes en Storage):
    ```cmd
    pnpm gen:snapshot
    ```
    `src/features/menu/data/menu.snapshot.json` es la copia estática que el
    build sirve si el backend no responde. **Versiónalo en git** y vuelve a
    generarlo (y commitear) cada vez que cambie la carta de forma notable.

### La carta pública

- La lee de Supabase vía PostgREST con `fetch` anónimo (sin
  `@supabase/supabase-js`, que solo se descarga en `/panel` y `/acceso`).
- _Stale-while-revalidate_: pinta al instante lo último que tenga
  (`localStorage` o el snapshot del build) y **revalida en cada carga de
  página**; dentro de la misma sesión dedupe de 20 s. Un cambio en el panel se
  ve recargando **una vez** (o al instante en una pestaña nueva sin caché).
- Si Supabase falla: `localStorage` → snapshot del build → (si nada) error
  suave. La web pública **no** necesita `VITE_SUPABASE_*` para funcionar: sin
  ellas usa siempre el snapshot.

### Tras cambios en la carta: snapshot + sitemap

El snapshot de respaldo y `public/sitemap.xml` (una URL por producto) **no** se
regeneran solos en el build. Cuando la carta cambie de forma notable:

```cmd
pnpm gen:snapshot     # lee de la BD, reescribe menu.snapshot.json y sitemap.xml
```

y commitea ambos. Con `-- --from-source` los genera desde `menu.ts` (sin
imágenes), útil solo antes del primer seed.

### Base de datos con un cliente de escritorio (DBeaver)

Para inspeccionar/editar datos a mano (con RLS **desactivada**, cuidado):

1. Supabase → _Project Settings → Database → Connection string_ → pestaña
   **Session pooler** (IPv4). Copia host, puerto (`5432`/`6543`), database
   (`postgres`) y user (`postgres.<REF>`). La contraseña es la del proyecto.
2. DBeaver → _New Database Connection_ → **PostgreSQL** → rellena esos datos.
   En _SSL_ marca _Use SSL_ (`sslmode = require`).
3. _Test Connection_ → _Finish_. El esquema de la app está en `public`.

> Editar filas por aquí **se salta las políticas RLS y los triggers de
> auditoría**. Úsalo para diagnóstico o correcciones puntuales; el día a día va
> por el panel.

### Tests

`pnpm test:run` (Vitest). Cubre la lógica pura y de riesgo, no la UI:

- **Guarda de acceso** — `resolveAccess` (estados pending/denied/ready/…).
- **Validación** — precios 1–50, títulos, alérgenos, bloques y sus ítems
  (incluye deltas negativos).
- **Mappers BD → app** — `mappers` (carta pública), `seedMapping`,
  `adminToProduct`.
- **Configurador** — `priceBreakdown`: base + opciones single/multiple +
  descuentos del combo, total ≥ 0, redondeo.
- **`friendlyError`** — códigos Postgres/PostgREST → mensajes en español.
- **Caché de la carta** — `menuStore` (snapshot / localStorage / red, sin
  bucles).
- **Cabeceras de seguridad** — `_headers` y `vercel.json` no divergen.
- **Accesos** — orden y formato de fechas de la lista de cuentas.

## Pendiente de aportar

- Logo oficial en vectorial (hoy se dibuja en `components/common/BrandLogo.tsx`).
- `public/og-image.jpg` (1200×630).
- URLs reales de Facebook / Instagram y coordenadas exactas del local
  (`src/config/site.ts`, marcadas con `TODO`).
- `VITE_SITE_URL` en `.env` con el dominio definitivo.
- **Al comprar el dominio:** cambiar en Supabase → _Authentication → URL
  Configuration_ el **Site URL** al dominio real (`https://mundoburguer.com`) y
  añadir sus _Redirect URLs_. Ahora mismo apunta a una IP/host temporal para
  pruebas. Google no se toca.
