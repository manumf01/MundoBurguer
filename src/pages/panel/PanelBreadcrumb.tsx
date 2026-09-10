import { Fragment } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const SECTION_LABELS: Record<string, string> = {
  carta: 'Carta',
  categorias: 'Categorías',
  menu: 'Configura tu menú',
  destacados: 'Destacados',
  solicitudes: 'Solicitudes',
  accesos: 'Accesos',
};

interface Crumb {
  label: string;
  to?: string;
}

function buildCrumbs(pathname: string): Crumb[] {
  const parts = pathname.replace(/\/+$/, '').split('/').filter(Boolean);
  const i = parts.indexOf('panel');
  const rest = i >= 0 ? parts.slice(i + 1) : [];

  const crumbs: Crumb[] = [{ label: 'Panel', to: '/panel' }];
  if (rest.length === 0) return crumbs;

  const section = rest[0] ?? '';
  crumbs.push({
    label: SECTION_LABELS[section] ?? section,
    to: rest.length > 1 ? `/panel/${section}` : undefined,
  });

  if (rest.length > 1) {
    const sub = rest[1] ?? '';
    crumbs.push({ label: sub === 'nueva' ? 'Nueva comida' : 'Editar comida' });
  }

  return crumbs;
}

/**
 * Migas de pan del panel. Sustituye al título «Panel» en todas las subvistas
 * (en `/panel` a secas no se muestra). El último nivel es la página actual.
 */
export function PanelBreadcrumb() {
  const { pathname } = useLocation();
  const crumbs = buildCrumbs(pathname);

  return (
    <nav
      aria-label="Ruta de navegación"
      className="flex flex-wrap items-center gap-x-2 gap-y-1 font-display text-xl tracking-wide sm:text-2xl"
    >
      {crumbs.map((c, idx) => {
        const last = idx === crumbs.length - 1;
        return (
          <Fragment key={`${c.label}-${idx}`}>
            {idx > 0 ? (
              <ChevronRight
                size={16}
                className="shrink-0 text-cream-mute/50"
                aria-hidden="true"
              />
            ) : null}
            {last ? (
              <h1 className="text-heat inline">{c.label}</h1>
            ) : c.to ? (
              <Link
                to={c.to}
                className="text-cream-mute transition-colors hover:text-amber"
              >
                {c.label}
              </Link>
            ) : (
              <span className="text-cream-mute">{c.label}</span>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}
