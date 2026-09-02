import { useEffect, useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Phone } from 'lucide-react';
import { mainNav } from '@/config/navigation';
import { site } from '@/config/site';
import { telHref } from '@/lib/format';
import { cn } from '@/lib/cn';
import { BrandLogo } from '@/components/common';
import { Button } from '@/components/ui';
import { MobileMenu } from './MobileMenu';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-40 transition-[background-color,box-shadow,backdrop-filter] duration-300',
        scrolled
          ? 'bg-bg/85 shadow-[0_1px_0_0_var(--color-hair)] backdrop-blur-md'
          : 'bg-transparent'
      )}
    >
      <div
        className={cn(
          'container-mb flex items-center justify-between transition-[height] duration-300',
          scrolled ? 'h-16' : 'h-[var(--spacing-nav)]'
        )}
      >
        <Link
          to="/"
          className="flex items-center gap-2.5"
          aria-label={`${site.name} — Inicio`}
        >
          <BrandLogo className="h-10 w-10 shrink-0" />
          <BrandLogo variant="wordmark" className="hidden sm:flex" />
        </Link>

        <nav
          className="hidden items-center gap-1 md:flex"
          aria-label="Principal"
        >
          {mainNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'rounded-full px-4 py-2 text-sm font-semibold tracking-wide transition-colors',
                  isActive ? 'text-amber' : 'text-cream-dim hover:text-cream'
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Button
            asChild
            variant="primary"
            size="sm"
            className="hidden sm:inline-flex"
          >
            <a href={telHref(site.phone.e164)}>
              <Phone size={16} aria-hidden="true" />
              <span className="hidden lg:inline">Llamar </span>
              {site.phone.display}
            </a>
          </Button>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
