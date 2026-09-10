import type { Profile } from '@/features/auth';

const STATUS_RANK: Record<Profile['status'], number> = {
  approved: 0,
  pending: 1,
  denied: 2,
};

/**
 * Orden para la vista de accesos: primero quien ya tiene acceso, luego las
 * solicitudes pendientes, luego los denegados; dentro de cada grupo, por
 * fecha de solicitud (más antiguas arriba).
 */
export function sortProfilesForAdmin(profiles: readonly Profile[]): Profile[] {
  return [...profiles].sort(
    (a, b) =>
      STATUS_RANK[a.status] - STATUS_RANK[b.status] ||
      a.requestedAt.localeCompare(b.requestedAt)
  );
}

/** ISO -> "3 may 2026" (o "—" si no es una fecha válida). */
export function formatRequestDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
}

/** ISO -> "3 may, 18:40" · `null` -> "nunca". Para "última desconexión". */
export function formatLastSeen(iso: string | null): string {
  if (!iso) return 'nunca';
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleString('es-ES', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
}
