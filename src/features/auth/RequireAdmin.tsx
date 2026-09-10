import type { ReactNode } from 'react';
import { useAuth } from './useAuth';
import { AuthFrame } from './AuthFrame';
import { RequireAccess } from './RequireAccess';

/**
 * Como `RequireAccess` pero además exige rol `admin` (lista blanca, roles,
 * solicitudes de acceso). Un `editor` autenticado ve un aviso, no un redirect.
 */
export function RequireAdmin({ children }: { children: ReactNode }) {
  const { access } = useAuth();

  if (access.status === 'ready' && access.role !== 'admin') {
    return (
      <AuthFrame>
        <h1 className="mb-2 font-display text-2xl tracking-wide text-cream">
          Sin permiso
        </h1>
        <p className="text-cream-dim">
          Esta sección es solo para administradores.
        </p>
      </AuthFrame>
    );
  }

  return <RequireAccess>{children}</RequireAccess>;
}
