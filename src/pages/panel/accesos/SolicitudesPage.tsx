import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert } from '@/components/ui';
import { Select } from '@/components/ui/Select';
import { LogoSpinner } from '@/components/common/LogoSpinner';
import type { AppRole, Profile } from '@/features/auth';
import { approveProfile, denyProfile, fetchProfiles } from '@/features/admin';
import { formatRequestDate } from './access';

export function SolicitudesPage() {
  const [rows, setRows] = useState<Profile[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [roleById, setRoleById] = useState<Record<string, AppRole>>({});

  const load = useCallback(async () => {
    try {
      const data = await fetchProfiles('pending');
      setRows(data);
      setError(null);
    } catch (e) {
      setRows([]);
      setError(
        e instanceof Error
          ? e.message
          : 'No se pudieron cargar las solicitudes.'
      );
    }
  }, []);

  useEffect(() => {
    let alive = true;
    fetchProfiles('pending')
      .then((data) => {
        if (alive) {
          setRows(data);
          setError(null);
        }
      })
      .catch(() => {
        if (alive) {
          setRows([]);
          setError('No se pudieron cargar las solicitudes.');
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
          Solicitudes de acceso
        </h2>
        <p className="mt-1 max-w-prose text-sm text-cream-mute">
          Cuentas de Google que han pedido entrar al panel y aún no tienen
          decisión. Para gestionar quién ya tiene acceso, ve a{' '}
          <Link
            to="/panel/accesos"
            className="text-amber underline underline-offset-2"
          >
            Accesos y roles
          </Link>
          .
        </p>
      </div>

      {error ? <Alert tone="error">{error}</Alert> : null}

      {rows === null ? (
        <LogoSpinner />
      ) : rows.length === 0 ? (
        <p className="rounded-2xl border border-hair bg-white/5 p-6 text-center text-sm text-cream-mute">
          No hay solicitudes pendientes.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {rows.map((p) => {
            const role: AppRole = roleById[p.id] ?? 'editor';
            const busy = busyId === p.id;
            return (
              <li
                key={p.id}
                className="flex flex-col gap-3 rounded-2xl border border-hair bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-cream">
                    {p.fullName || p.email}
                  </p>
                  <p className="truncate text-xs text-cream-mute">
                    {p.email} · pidió acceso el{' '}
                    {formatRequestDate(p.requestedAt)}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="w-28">
                    <Select
                      ariaLabel={`Rol para ${p.email}`}
                      value={role}
                      onValueChange={(r) =>
                        setRoleById((m) => ({ ...m, [p.id]: r as AppRole }))
                      }
                      options={[
                        { value: 'editor', label: 'Editor' },
                        { value: 'admin', label: 'Admin' },
                      ]}
                    />
                  </div>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      void act(
                        p.id,
                        () => approveProfile(p.id, role),
                        'No se pudo aprobar.'
                      )
                    }
                    className="rounded-lg border border-lime/50 bg-lime/10 px-3 py-2 text-xs font-semibold text-lime transition-colors hover:bg-lime/20 disabled:opacity-40"
                  >
                    Aprobar
                  </button>
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
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
