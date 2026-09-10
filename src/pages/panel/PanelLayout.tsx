import { Outlet, useLocation } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { Seo } from '@/lib/seo';
import { Container, Eyebrow } from '@/components/ui';
import { RequireAccess, useAuth } from '@/features/auth';
import { PanelBreadcrumb } from './PanelBreadcrumb';

function Shell() {
  const { profile, signOut } = useAuth();
  const { pathname } = useLocation();
  const atHome = pathname === '/panel' || pathname === '/panel/';

  return (
    <Container className="py-12 sm:py-14">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Eyebrow>Administración</Eyebrow>
          {atHome ? (
            <h1 className="text-heat text-4xl sm:text-5xl">Panel</h1>
          ) : (
            <PanelBreadcrumb />
          )}
        </div>
        <div className="flex items-center gap-3 text-sm text-cream-mute">
          <span className="rounded-full border border-hair bg-white/5 px-2 py-0.5 text-xs uppercase tracking-widest text-amber">
            {profile?.role}
          </span>
          {atHome ? (
            <button
              type="button"
              onClick={() => void signOut()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-hair bg-white/5 px-3 py-1.5 text-xs font-semibold text-cream-dim transition-colors hover:border-amber/50 hover:bg-amber/10 hover:text-cream"
            >
              <LogOut size={14} aria-hidden="true" />
              Cerrar sesión
            </button>
          ) : null}
        </div>
      </header>

      <div className="mt-8">
        <Outlet />
      </div>
    </Container>
  );
}

/** Layout de `/panel`: dentro de <Layout> (navbar + footer), protegido por sesión. */
export function PanelLayout() {
  return (
    <>
      <Seo title="Panel" noindex bare />
      <RequireAccess>
        <Shell />
      </RequireAccess>
    </>
  );
}
