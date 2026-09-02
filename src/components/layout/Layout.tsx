import { Outlet } from 'react-router-dom';
import { ScrollToTop } from '@/components/common';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export function Layout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <ScrollToTop />
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-amber focus:px-4 focus:py-2 focus:text-bg"
      >
        Saltar al contenido
      </a>
      <Navbar />
      <main id="contenido" className="flex-1 pt-[var(--spacing-nav)]">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
