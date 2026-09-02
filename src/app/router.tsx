import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { HomePage } from '@/pages/HomePage';
import { features } from '@/config/features';

/**
 * Rutas condicionadas por feature flag. Hoy vacío: la web es informativa.
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

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: 'carta',
        lazy: async () => {
          const m = await import('@/pages/MenuPage');
          return { Component: m.MenuPage };
        },
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
      ...futureRoutes,
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
