import type { AccessState, Profile } from './types';

export interface AccessInput {
  /** Hay credenciales de Supabase (`VITE_SUPABASE_*`). */
  configured: boolean;
  /** Sesión / perfil aún resolviéndose. */
  loading: boolean;
  hasSession: boolean;
  profile: Profile | null;
}

/**
 * Traduce sesión + perfil al estado de acceso que consume la UI (pantalla de
 * `/acceso` y guardas de `/panel`). No decide permisos de datos: eso lo hace
 * RLS en el servidor.
 */
export function resolveAccess(input: AccessInput): AccessState {
  if (!input.configured) return { status: 'unconfigured' };
  if (input.loading) return { status: 'loading' };
  if (!input.hasSession) return { status: 'anonymous' };
  // Sesión válida pero el perfil todavía no ha llegado (o se está creando).
  if (!input.profile) return { status: 'loading' };

  if (input.profile.status === 'denied') return { status: 'denied' };

  if (
    input.profile.status === 'approved' &&
    (input.profile.role === 'admin' || input.profile.role === 'editor')
  ) {
    return { status: 'ready', role: input.profile.role };
  }

  // 'pending', o cualquier estado incoherente (p. ej. approved sin rol): se
  // trata como solicitud pendiente, nunca como acceso concedido.
  return { status: 'pending' };
}
