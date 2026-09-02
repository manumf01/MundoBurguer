import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Lleva el scroll al inicio en cada cambio de ruta (salvo si hay ancla). */
export function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname, hash]);

  return null;
}
