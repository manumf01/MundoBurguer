import {
  createBrowserRouter,
  Navigate,
  type RouteObject,
} from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { HomePage } from '@/pages/HomePage';
import { features } from '@/config/features';

/** Azúcar para una ruta hija del panel que carga un componente de `sections.tsx`. */
const panelSection = (name: string): RouteObject['lazy'] => async () => {
  const m = await import('@/pages/panel/sections');
  return { Component: m[name as keyof typeof m] };
};

/**
 * Rutas condicionadas por feature flag. Por ahora están vacías: la web es informativa.
 * Cuando se active `onlineOrdering` / `reservations`, se añaden aquí sus
 * páginas (lazy) y el resto de la app ya está preparada (ver src/config/features.ts).
 */
const futureRoutes: RouteObject[] = [
  ...(features.onlineOrdering
    ? [
      {
        path: 'pedir',
        lazy: async () => {
          const m = await import('@/pages/NotFoundPage');
          return { Component: m.NotFoundPage };
        },
      },
    ]
    : []),
  ...(features.reservations
    ? [
      {
        path: 'reservar',
        lazy: async () => {
          const m = await import('@/pages/NotFoundPage');
          return { Component: m.NotFoundPage };
        },
      },
    ]
    : []),
];

/**
 * Parte privada de administración. Va DENTRO de <Layout> (mismo navbar, footer
 * y fondo que el resto de la web), envuelta en <PrivateArea>, que solo aporta
 * la sesión (`AuthProvider`) y es `lazy`, así `@supabase/supabase-js` no entra
 * en el bundle público. Rutas discretas: sin enlaces internos indexables, en
 * noindex (ver <Seo noindex>) y bloqueadas en robots.txt.
 */
const privateRoutes: RouteObject[] = features.adminPanel
  ? [
      {
        lazy: async () => {
          const m = await import('@/features/auth/PrivateArea');
          return { Component: m.PrivateArea };
        },
        children: [
          {
            path: 'acceso',
            lazy: async () => {
              const m = await import('@/pages/AccesoPage');
              return { Component: m.AccesoPage };
            },
          },
          {
            path: 'panel',
            lazy: async () => {
              const m = await import('@/pages/panel/PanelLayout');
              return { Component: m.PanelLayout };
            },
            children: [
              {
                index: true,
                lazy: async () => {
                  const m = await import('@/pages/panel/PanelHome');
                  return { Component: m.PanelHome };
                },
              },
              {
                // Provee la carta completa (AdminMenuProvider) a estas secciones.
                lazy: async () => {
                  const m = await import('@/pages/panel/carta/PanelMenuArea');
                  return { Component: m.PanelMenuArea };
                },
                children: [
                  {
                    path: 'carta',
                    children: [
                      {
                        index: true,
                        lazy: async () => {
                          const m = await import(
                            '@/pages/panel/carta/ProductListPage'
                          );
                          return { Component: m.ProductListPage };
                        },
                      },
                      {
                        path: 'nueva',
                        lazy: async () => {
                          const m = await import(
                            '@/pages/panel/carta/ProductFormPage'
                          );
                          return { Component: m.ProductFormPage };
                        },
                      },
                      {
                        path: ':slug',
                        lazy: async () => {
                          const m = await import(
                            '@/pages/panel/carta/ProductFormPage'
                          );
                          return { Component: m.ProductFormPage };
                        },
                      },
                    ],
                  },
                  {
                    path: 'categorias',
                    lazy: async () => {
                      const m = await import(
                        '@/pages/panel/categorias/CategoryListPage'
                      );
                      return { Component: m.CategoryListPage };
                    },
                  },
                  {
                    path: 'menu',
                    lazy: async () => {
                      const m = await import(
                        '@/pages/panel/menu-config/MenuConfigPage'
                      );
                      return { Component: m.MenuConfigPage };
                    },
                  },
                  {
                    path: 'destacados',
                    lazy: async () => {
                      const m = await import(
                        '@/pages/panel/destacados/FeaturedPage'
                      );
                      return { Component: m.FeaturedPage };
                    },
                  },
                ],
              },
              { path: 'solicitudes', lazy: panelSection('PanelSolicitudes') },
              { path: 'accesos', lazy: panelSection('PanelAccesos') },
              { path: '*', element: <Navigate to="/panel" replace /> },
            ],
          },
        ],
      },
    ]
  : [];

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: 'carta',
        children: [
          {
            index: true,
            lazy: async () => {
              const m = await import('@/pages/MenuPage');
              return { Component: m.MenuPage };
            },
          },
          {
            path: ':slug',
            lazy: async () => {
              const m = await import('@/pages/ProductDetailPage');
              return { Component: m.ProductDetailPage };
            },
          },
        ],
      },
      {
        path: 'sobre-nosotros',
        lazy: async () => {
          const m = await import('@/pages/AboutPage');
          return { Component: m.AboutPage };
        },
      },
      {
        path: 'contacto',
        lazy: async () => {
          const m = await import('@/pages/ContactPage');
          return { Component: m.ContactPage };
        },
      },
      {
        path: 'aviso-legal',
        lazy: async () => {
          const m = await import('@/pages/LegalNoticePage');
          return { Component: m.LegalNoticePage };
        },
      },
      {
        path: 'politica-privacidad',
        lazy: async () => {
          const m = await import('@/pages/PrivacyPolicyPage');
          return { Component: m.PrivacyPolicyPage };
        },
      },
      {
        path: 'politica-cookies',
        lazy: async () => {
          const m = await import('@/pages/CookiePolicyPage');
          return { Component: m.CookiePolicyPage };
        },
      },
      ...futureRoutes,
      ...privateRoutes,
      {
        path: '*',
        lazy: async () => {
          const m = await import('@/pages/NotFoundPage');
          return { Component: m.NotFoundPage };
        },
      },
    ],
  },
]);
