import type { ReactNode } from 'react';
import { MotionConfig } from 'framer-motion';
import { CookieConsentProvider } from '@/lib/cookieConsent';

/**
 * Proveedores globales de la app: animación (respeta `prefers-reduced-motion`)
 * y el consentimiento de cookies (banner + Google Analytics gateado, ver
 * src/lib/cookieConsent.tsx). Punto de anclaje para el futuro:
 * QueryClientProvider, tema, i18n, etc.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <CookieConsentProvider>{children}</CookieConsentProvider>
    </MotionConfig>
  );
}
