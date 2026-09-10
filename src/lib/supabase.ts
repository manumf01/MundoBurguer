import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * `true` cuando hay credenciales de Supabase configuradas. La web pública
 * funciona sin ellas: la carta cae a su snapshot estático (ver
 * `src/features/menu/data/menu.snapshot.json`) y el panel privado (`/panel`)
 * queda inaccesible.
 */
export const isSupabaseConfigured = Boolean(url && anonKey);

let client: SupabaseClient | null = null;

/**
 * Cliente Supabase único (perezoso). Se instancia en la primera llamada para
 * no romper el arranque ni el build cuando las variables de entorno no están
 * definidas. Usa PKCE y `detectSessionInUrl` para cerrar el login con Google
 * al volver del redirect (ver `src/features/auth/`).
 */
export function getSupabase(): SupabaseClient {
  if (client) return client;
  if (!url || !anonKey) {
    throw new Error(
      'Supabase no está configurado: define VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.'
    );
  }
  client = createClient(url, anonKey, {
    auth: {
      flowType: 'pkce',
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
  return client;
}
