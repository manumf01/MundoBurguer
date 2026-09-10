import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { LogoSpinner } from '@/components/common/LogoSpinner';
import { useAuth } from './useAuth';
import { AuthFrame } from './AuthFrame';

/**
 * Protege rutas privadas. Comprobación de cliente; la de servidor la hace RLS
 * en cada consulta.
 *
 * El `LogoSpinner` de carga solo aparece en la primera resolución de la
 * sesión: `AuthProvider` nunca vuelve a poner `loading` a true ni descarta el
 * perfil en las revalidaciones (foco de pestaña, refresco de token, montaje de
 * una subvista), así que al navegar entre carta/categorías/etc. no reaparece.
 */
export function RequireAccess({ children }: { children: ReactNode }) {
  const { access } = useAuth();
  const location = useLocation();

  switch (access.status) {
    case 'ready':
      return <>{children}</>;

    case 'loading':
      return <LogoSpinner />;

    case 'unconfigured':
      return (
        <AuthFrame>
          <p className="text-cream-dim">
            El acceso a la administración no está disponible ahora mismo.
          </p>
        </AuthFrame>
      );

    case 'anonymous':
    case 'pending':
    case 'denied':
      return (
        <Navigate to="/acceso" replace state={{ from: location.pathname }} />
      );
  }
}
