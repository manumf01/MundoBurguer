import { Link, NavLink } from 'react-router-dom';
import { MapPin, Phone, Clock } from 'lucide-react';
import { footerNav } from '@/config/navigation';
import { site } from '@/config/site';
import { telHref } from '@/lib/format';
import { Container } from '@/components/ui';
import { BrandLogo, SocialLinks } from '@/components/common';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-hair bg-bg-elevated">
      <Container className="py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <BrandLogo className="h-14 shrink-0" decorative />
              <BrandLogo variant="wordmark" />
            </div>
            <p className="font-script text-xl text-amber">{site.slogan}</p>
            <SocialLinks className="mt-1" />
          </div>

          <nav aria-label="Pie de página">
            <h2 className="mb-3 text-sm text-cream-mute">Navegación</h2>
            <ul className="flex flex-col gap-2 text-sm">
              {footerNav.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className="text-cream-dim transition-colors hover:text-cream"
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="mb-3 text-sm text-cream-mute">Dónde y cuándo</h2>
            <address className="flex flex-col gap-2.5 text-sm text-cream-dim not-italic">
              <span className="flex items-start gap-2">
                <MapPin
                  size={16}
                  className="mt-0.5 shrink-0 text-amber"
                  aria-hidden="true"
                />
                {site.address.full}
              </span>
              <a
                href={telHref(site.phone.e164)}
                className="flex items-center gap-2 transition-colors hover:text-cream"
              >
                <Phone
                  size={16}
                  className="shrink-0 text-amber"
                  aria-hidden="true"
                />
                {site.phone.display}
              </a>
              <span className="flex items-start gap-2">
                <Clock
                  size={16}
                  className="mt-0.5 shrink-0 text-amber"
                  aria-hidden="true"
                />
                {site.hours.summary}
              </span>
            </address>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-hair pt-6 text-xs text-cream-mute sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.name}. Todos los derechos reservados.
          </p>
          <p>
            <Link to="/carta" className="hover:text-cream-dim">
              Información de alérgenos disponible en la carta
            </Link>
          </p>
        </div>
      </Container>
    </footer>
  );
}
