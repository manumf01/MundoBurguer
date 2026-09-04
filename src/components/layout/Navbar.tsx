import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  const { pathname } = useLocation();

  const navRef = useRef<HTMLElement>(null);
  const linkRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  // Posición/ancho de la píldora activa DENTRO de la barra de navegación
  // (coordenadas relativas al <nav>, nunca al viewport → nunca "entra desde
  // fuera" al cambiar de ruta o al hacer scroll).
  const [pill, setPill] = useState<{ x: number; width: number } | null>(null);

  const activeIndex = mainNav.findIndex((item) =>
    item.end
      ? pathname === item.to
      : pathname === item.to || pathname.startsWith(`${item.to}/`)
  );

  const measurePill = useCallback(() => {
    const nav = navRef.current;
    const el = linkRefs.current[activeIndex];
    if (!nav || !el) {
      setPill(null);
      return;
    }
    const navBox = nav.getBoundingClientRect();
    const linkBox = el.getBoundingClientRect();
    setPill({ x: linkBox.left - navBox.left, width: linkBox.width });
  }, [activeIndex]);

  useLayoutEffect(() => {
    measurePill();
  }, [measurePill]);

  useEffect(() => {
    window.addEventListener('resize', measurePill);
    return () => window.removeEventListener('resize', measurePill);
  }, [measurePill]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-40 transition-[background-color,box-shadow,backdrop-filter,border-color] duration-300',
        scrolled
          ? 'border-b border-hair bg-bg/80 shadow-[0_10px_30px_-16px_rgba(0,0,0,0.7)] backdrop-blur-xl'
          : 'border-b border-transparent bg-transparent'
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
          className="flex items-center gap-2.5 rounded-full transition-opacity hover:opacity-90"
          aria-label={`${site.name} — Inicio`}
        >
          <BrandLogo className="h-11 shrink-0 sm:h-12" decorative />
          <BrandLogo variant="wordmark" className="hidden sm:flex" />
        </Link>

        <nav
          ref={navRef}
          className="relative hidden items-center gap-1 rounded-full border border-hair bg-white/[0.03] p-1 md:flex"
          aria-label="Principal"
        >
          {pill ? (
            <motion.span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-1 left-0 rounded-full bg-amber/12 ring-1 ring-inset ring-amber/25"
              initial={false}
              animate={{ x: pill.x, width: pill.width }}
              transition={{
                type: 'spring',
                stiffness: 500,
                damping: 40,
                mass: 0.7,
              }}
            />
          ) : null}

          {mainNav.map((item, i) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              ref={(el) => {
                linkRefs.current[i] = el;
              }}
              className={({ isActive }) =>
                cn(
                  'relative z-10 rounded-full px-4 py-1.5 text-sm font-semibold tracking-wide transition-colors',
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
