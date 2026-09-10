/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL pública del sitio (canonical, Open Graph, sitemap). */
  readonly VITE_SITE_URL?: string;
  /** Measurement ID de Google Analytics 4 ("G-XXXXXXX"). Vacío = no se carga. */
  readonly VITE_GA_MEASUREMENT_ID?: string;
  /** URL del proyecto Supabase (https://<ref>.supabase.co). Pública. */
  readonly VITE_SUPABASE_URL?: string;
  /** Clave anónima de Supabase. Pública por diseño: la seguridad la aplica RLS. */
  readonly VITE_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
