import { Link } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { panelNav } from './nav';

export function PanelHome() {
  const { access, profile } = useAuth();
  const isAdmin = access.status === 'ready' && access.role === 'admin';
  const shortcuts = panelNav.filter(
    (item) => item.to !== '' && (!item.adminOnly || isAdmin)
  );

  return (
    <div className="flex flex-col gap-6">
      <p className="max-w-prose text-cream-dim">
        Hola{profile?.fullName ? `, ${profile.fullName}` : ''}. Desde aquí se
        gestiona la carta de la web (comidas, categorías, precios, imágenes y el
        bloque «Configura tu Menú») sin tocar código ni volver a desplegar.
      </p>

      <ul className="grid gap-3 sm:grid-cols-2">
        {shortcuts.map((item) => (
          <li key={item.to}>
            <Link
              to={`/panel/${item.to}`}
              className="block rounded-2xl border border-hair bg-white/5 p-5 transition-colors hover:border-amber/40 hover:bg-amber/5"
            >
              <span className="font-display text-lg tracking-wide text-cream">
                {item.label}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
