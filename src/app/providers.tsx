import type { ReactNode } from 'react';
import { MotionConfig } from 'framer-motion';
import { CookieConsentProvider } from '@/lib/cookieConsent';

/**
 * Proveedores globales de la app: animación (respeta `prefers-reduced-motion`)
 * y el consentimiento de cookies (banner + Google Analytics gateado, ver
 * src/lib/cookieConsent.tsx).
 *
 * La sesión de administración (`AuthProvider`) NO va aquí: vive dentro del
 * árbol de rutas privadas (`src/features/auth/PrivateArea.tsx`) para que
 * `@supabase/supabase-js` quede en el chunk lazy de `/panel` y la web pública
 * no lo descargue.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <CookieConsentProvider>{children}</CookieConsentProvider>
    </MotionConfig>
  );
}
