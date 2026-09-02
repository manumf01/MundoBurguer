import type { ReactNode } from 'react';
import { MotionConfig } from 'framer-motion';

/**
 * Proveedores globales de la app. Hoy solo configuración de animación
 * (respeta `prefers-reduced-motion`). Punto de anclaje para el futuro:
 * QueryClientProvider, tema, i18n, analytics, etc.
 */
export function Providers({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
