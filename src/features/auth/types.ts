export type ProfileStatus = 'pending' | 'approved' | 'denied';
export type AppRole = 'admin' | 'editor';

/** Perfil del usuario, en camelCase para la app. */
export interface Profile {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  status: ProfileStatus;
  role: AppRole | null;
  requestedAt: string;
  /** Última vez que se le "vio" activo (≈ hora de desconexión). */
  lastSeenAt: string | null;
}

/** Fila `public.profiles` tal cual la devuelve Supabase (RPC `ensure_profile`). */
export interface ProfileRow {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  status: ProfileStatus;
  role: AppRole | null;
  requested_at: string;
  last_seen_at?: string | null;
}

/**
 * Lo que la UI necesita saber para decidir qué pantalla mostrar. La
 * autorización REAL la aplican las políticas RLS de Postgres.
 */
export type AccessState =
  | { status: 'loading' }
  | { status: 'unconfigured' }
  | { status: 'anonymous' }
  | { status: 'pending' }
  | { status: 'denied' }
  | { status: 'ready'; role: AppRole };

export function mapProfileRow(row: ProfileRow): Profile {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    avatarUrl: row.avatar_url,
    status: row.status,
    role: row.role,
    requestedAt: row.requested_at,
    lastSeenAt: row.last_seen_at ?? null,
  };
}
