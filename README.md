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

## Estructura

```
src/
  app/         Shell: App, providers, router
  config/      site.ts (datos del negocio), navigation.ts, features.ts
  lib/         cn, format, seo (Seo + JSON-LD)
  components/  ui/ (design system), layout/, common/
  features/    menu/ home/ about/ contact/  (components + data + hooks por feature)
  pages/       HomePage, MenuPage, AboutPage, ContactPage, NotFoundPage
  services/    http.ts (sin uso hoy; punto de extensión para el backend)
  styles/      index.css (Tailwind + tokens)
  assets/brand/ slogan.png, logo.png (provisional — ver su README)
```

Fuente de verdad del negocio: **`src/config/site.ts`**.
Carta completa: **`src/features/menu/data/`** (`menu.ts`, `allergens.ts`,
`menuConfig.ts`), transcrita de `src/docs/Z CARTA MB 2024.pdf`.

## Pendiente de aportar

- Logo oficial en vectorial (hoy se dibuja en `components/common/BrandLogo.tsx`).
- `public/og-image.jpg` (1200×630).
- URLs reales de Facebook / Instagram y coordenadas exactas del local
  (`src/config/site.ts`, marcadas con `TODO`).
- `VITE_SITE_URL` en `.env` con el dominio definitivo.
