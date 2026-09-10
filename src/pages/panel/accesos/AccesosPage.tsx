import { useCallback, useEffect, useState } from 'react';
import { Alert } from '@/components/ui';
import { Select } from '@/components/ui/Select';
import { LogoSpinner } from '@/components/common/LogoSpinner';
import { useAuth, type AppRole, type Profile } from '@/features/auth';
import {
  approveProfile,
  denyProfile,
  fetchProfiles,
  reopenProfile,
  setProfileRole,
} from '@/features/admin';
import {
  formatLastSeen,
  formatRequestDate,
  sortProfilesForAdmin,
} from './access';
import { RoleBadge, StatusBadge } from './AccessBadges';

const ROLE_OPTIONS = [
  { value: 'editor', label: 'Editor' },
  { value: 'admin', label: 'Admin' },
];

export function AccesosPage() {
  const { profile: me } = useAuth();
  const [rows, setRows] = useState<Profile[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [roleById, setRoleById] = useState<Record<string, AppRole>>({});

  const load = useCallback(async () => {
    try {
      const data = await fetchProfiles();
      setRows(sortProfilesForAdmin(data));
      setError(null);
    } catch (e) {
      setRows([]);
      setError(
        e instanceof Error ? e.message : 'No se pudieron cargar los accesos.'
      );
    }
  }, []);

  useEffect(() => {
    let alive = true;
    fetchProfiles()
      .then((data) => {
        if (alive) {
          setRows(sortProfilesForAdmin(data));
          setError(null);
        }
      })
      .catch(() => {
        if (alive) {
          setRows([]);
          setError('No se pudieron cargar los accesos.');
        }
      });
    return () => {
      alive = false;
    };
  }, []);

  async function act(id: string, fn: () => Promise<void>, fail: string) {
    setError(null);
    setBusyId(id);
    try {
      await fn();
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : fail);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-2xl tracking-wide text-cream">
          Accesos y roles
        </h2>
        <p className="mt-1 max-w-prose text-sm text-cream-mute">
          Todas las cuentas que han intentado entrar. Cambia el rol de quien
          tiene acceso o revócaselo. No puedes tocar tu propia cuenta y siempre
          debe quedar al menos un administrador.
        </p>
      </div>

      {error ? <Alert tone="error">{error}</Alert> : null}

      {rows === null ? (
        <LogoSpinner />
      ) : rows.length === 0 ? (
        <p className="rounded-2xl border border-hair bg-white/5 p-6 text-center text-sm text-cream-mute">
          Todavía nadie ha intentado entrar.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {rows.map((p) => {
            const isSelf = me?.id === p.id;
            const busy = busyId === p.id;
            const pendingRole: AppRole =
              roleById[p.id] ?? (p.role as AppRole | null) ?? 'editor';

            return (
              <li
                key={p.id}
                className="flex flex-col gap-3 rounded-2xl border border-hair bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="flex items-center gap-2 truncate font-semibold text-cream">
                    {p.fullName || p.email}
                    {isSelf ? (
                      <span className="rounded bg-amber/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber">
                        tú
                      </span>
                    ) : null}
                  </p>
                  <p className="truncate text-xs text-cream-mute">
                    {p.email} · desde el {formatRequestDate(p.requestedAt)}
                    {!isSelf ? (
                      <>
                        {' · última desconexión: '}
                        {formatLastSeen(p.lastSeenAt)}
                      </>
                    ) : null}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={p.status} />

                  {isSelf ? (
                    <RoleBadge role={p.role} />
                  ) : p.status === 'approved' ? (
                    <>
                      <div className="w-28">
                        <Select
                          ariaLabel={`Rol de ${p.email}`}
                          value={(p.role as AppRole | null) ?? 'editor'}
                          disabled={busy}
                          onValueChange={(r) =>
                            void act(
                              p.id,
                              () => setProfileRole(p.id, r as AppRole),
                              'No se pudo cambiar el rol.'
                            )
                          }
                          options={ROLE_OPTIONS}
                        />
                      </div>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          void act(
                            p.id,
                            () => denyProfile(p.id),
                            'No se pudo revocar el acceso.'
                          )
                        }
                        className="rounded-lg border border-brand-light/50 bg-brand/10 px-3 py-2 text-xs font-semibold text-brand-light transition-colors hover:bg-brand/20 disabled:opacity-40"
                      >
                        Revocar
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="w-28">
                        <Select
                          ariaLabel={`Rol para ${p.email}`}
                          value={pendingRole}
                          disabled={busy}
                          onValueChange={(r) =>
                            setRoleById((m) => ({
                              ...m,
                              [p.id]: r as AppRole,
                            }))
                          }
                          options={ROLE_OPTIONS}
                        />
                      </div>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          void act(
                            p.id,
                            () => approveProfile(p.id, pendingRole),
                            'No se pudo aprobar.'
                          )
                        }
                        className="rounded-lg border border-lime/50 bg-lime/10 px-3 py-2 text-xs font-semibold text-lime transition-colors hover:bg-lime/20 disabled:opacity-40"
                      >
                        {p.status === 'denied' ? 'Dar acceso' : 'Aprobar'}
                      </button>
                      {p.status === 'denied' ? (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            void act(
                              p.id,
                              () => reopenProfile(p.id),
                              'No se pudo reabrir.'
                            )
                          }
                          className="rounded-lg border border-hair px-3 py-2 text-xs font-semibold text-cream-dim transition-colors hover:border-hair-strong hover:text-cream disabled:opacity-40"
                        >
                          A pendiente
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            void act(
                              p.id,
                              () => denyProfile(p.id),
                              'No se pudo denegar.'
                            )
                          }
                          className="rounded-lg border border-brand-light/50 bg-brand/10 px-3 py-2 text-xs font-semibold text-brand-light transition-colors hover:bg-brand/20 disabled:opacity-40"
                        >
                          Denegar
                        </button>
                      )}
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
