import { Outlet } from 'react-router-dom';
import { AuthProvider } from './AuthProvider';

/**
 * Layout de las rutas privadas (`/acceso`, `/panel`). Solo provee la sesión.
 * Al ser una ruta `lazy`, `@supabase/supabase-js` queda en este chunk y no
 * en el bundle inicial de la web pública.
 */
export function PrivateArea() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}
