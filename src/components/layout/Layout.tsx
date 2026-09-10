import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { ScrollToTop, CookieConsentBanner } from '@/components/common';
import { useCookieConsent } from '@/lib/cookieConsentContext';
import { trackPageView } from '@/lib/analytics';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

/** Rutas privadas: no se miden en analítica (van también en noindex). */
const PRIVATE_PREFIXES = ['/acceso', '/panel'];

/** Envía un page_view a GA4 en cada navegación del router, solo si hay consentimiento. */
function AnalyticsPageViewTracker() {
  const location = useLocation();
  const { consent } = useCookieConsent();

  useEffect(() => {
    const isPrivate = PRIVATE_PREFIXES.some((p) =>
      location.pathname.startsWith(p)
    );
    if (consent?.analytics && !isPrivate) {
      trackPageView(location.pathname + location.search);
    }
  }, [location.pathname, location.search, consent?.analytics]);

  return null;
}

/**
 * Transición de entrada para el contenido de cada vista al navegar entre
 * rutas — un fundido con leve desplazamiento, igual en todas las páginas,
 * para que cambiar de sección no se sienta tan seco. Es la misma envoltura
 * para cualquier ruta nueva que se añada: no hace falta animar cada página
 * por separado.
 *
 * Animación por CSS (`.anim-page-enter`, ver src/styles/index.css) y no con
 * framer-motion: al ser una propiedad `animation` normal, el navegador la
 * aplica desde el primer fotograma calculado para el elemento, antes de
 * pintarlo — con un `motion.div` controlado por efectos de React se veía un
 * parpadeo (el contenido aparecía ya visible un instante antes de que la
 * animación de entrada se disparase).
 */
function PageTransition() {
  const location = useLocation();

  return (
    <div key={location.pathname} className="anim-page-enter">
      <Outlet />
    </div>
  );
}

export function Layout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <ScrollToTop />
      <AnalyticsPageViewTracker />
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-amber focus:px-4 focus:py-2 focus:text-bg"
      >
        Saltar al contenido
      </a>
      <Navbar />
      <main id="contenido" className="flex-1 pt-[var(--spacing-nav)]">
        <PageTransition />
      </main>
      <Footer />
      <CookieConsentBanner />
    </div>
  );
}
