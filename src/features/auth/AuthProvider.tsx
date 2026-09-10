import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { AuthContext, type AuthContextValue } from './authContext';
import { resolveAccess } from './authAccess';
import { mapProfileRow, type Profile, type ProfileRow } from './types';

/** La sesión se cierra sola tras 15 min sin usar la parte privada. */
const IDLE_MS = 15 * 60 * 1000;
/** Marca de tiempo del último uso (se comparte entre pestañas). */
const ACTIVITY_KEY = 'mb.panel.lastActivity';
/** No se escribe la marca más de una vez cada 15 s. */
const ACTIVITY_THROTTLE_MS = 15 * 1000;

function readLastActivity(): number | null {
  try {
    const v = Number(localStorage.getItem(ACTIVITY_KEY));
    return Number.isFinite(v) && v > 0 ? v : null;
  } catch {
    return null;
  }
}

function writeLastActivity(ts: number): void {
  try {
    localStorage.setItem(ACTIVITY_KEY, String(ts));
  } catch {
    /* almacenamiento no disponible: el temporizador seguirá con su copia en memoria */
  }
}

function clearLastActivity(): void {
  try {
    localStorage.removeItem(ACTIVITY_KEY);
  } catch {
    /* ignore */
  }
}

/** Refresca `profiles.last_seen_at` (mejor esfuerzo, ignora errores). */
async function pingLastSeen(): Promise<void> {
  try {
    await getSupabase().rpc('touch_last_seen');
  } catch {
    /* red caída o migración sin aplicar: no es crítico */
  }
}

/**
 * Sesión de Supabase + perfil del usuario. Si no hay credenciales
 * (`VITE_SUPABASE_*`) no hace nada: la web pública funciona igual.
 *
 * El perfil se obtiene con la RPC `ensure_profile`, que lo crea al vuelo si el
 * trigger de alta no llegó a existir (ver supabase/migrations 0002).
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [hasSession, setHasSession] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  // Ignora respuestas de cargas de perfil que hayan quedado obsoletas.
  const loadSeq = useRef(0);
  // Solo la PRIMERA carga muestra "Comprobando acceso"; las revalidaciones
  // posteriores (foco de pestaña, refresco de token…) actualizan en segundo
  // plano sin volver a poner `loading` a true.
  const everLoaded = useRef(false);

  const loadProfile = useCallback(async () => {
    const seq = ++loadSeq.current;
    if (!everLoaded.current) setLoading(true);
    try {
      const { data, error } = await getSupabase().rpc('ensure_profile');
      if (seq !== loadSeq.current) return;
      if (!error && data) {
        setProfile(mapProfileRow(data as ProfileRow));
        everLoaded.current = true;
      } else if (error && !everLoaded.current) {
        // Fallo en la PRIMERA carga: no hay perfil que mostrar.
        // En revalidaciones (foco de pestaña, token caducado un instante…)
        // conservamos el último perfil bueno para no parpadear a
        // "Comprobando acceso".
        setProfile(null);
      }
    } finally {
      if (seq === loadSeq.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Sin credenciales el estado inicial ya es correcto (loading = false).
    if (!isSupabaseConfigured) return;
    // `onAuthStateChange` emite `INITIAL_SESSION` al suscribirse, así que
    // cubre también el arranque sin llamar a `getSession` por separado.
    const { data: sub } = getSupabase().auth.onAuthStateChange(
      (event, session) => {
        setHasSession(Boolean(session));
        if (!session) {
          setProfile(null);
          setLoading(false);
          clearLastActivity();
          return;
        }
        // Login recién hecho: el contador de inactividad arranca ahora, sin
        // heredar una marca vieja de una sesión anterior. Solo se reinicia si
        // no hay marca válida (así un `SIGNED_IN` espurio al volver el foco no
        // alarga una sesión que ya estaba contando).
        if (event === 'SIGNED_IN') {
          const last = readLastActivity();
          if (last == null || Date.now() - last >= IDLE_MS) {
            writeLastActivity(Date.now());
          }
        }
        // El token se renovó solo: la sesión sigue y el perfil no cambia.
        if (event === 'TOKEN_REFRESHED') return;
        void loadProfile();
      }
    );
    return () => sub.subscription.unsubscribe();
  }, [loadProfile]);

  // Cierre de sesión por inactividad: 30 min sin interacción en la parte
  // privada (este proveedor solo está montado en `/acceso` y `/panel`).
  useEffect(() => {
    if (!isSupabaseConfigured || !hasSession) return;

    const check = (): boolean => {
      const last = readLastActivity();
      if (last != null && Date.now() - last >= IDLE_MS) {
        clearLastActivity();
        void (async () => {
          await pingLastSeen();
          await getSupabase().auth.signOut();
        })();
        return true;
      }
      return false;
    };

    // Al entrar: si el último uso fue hace más de 30 min (p. ej. pestaña
    // cerrada un buen rato), se cierra sesión ya.
    if (check()) return;

    let lastWrite = Date.now();
    writeLastActivity(lastWrite);

    // Heartbeat: marca "última vez visto" (≈ hora de desconexión) mientras el
    // panel está abierto y en primer plano.
    void pingLastSeen();
    const pingInterval = window.setInterval(() => {
      if (document.visibilityState === 'visible') void pingLastSeen();
    }, 2 * 60 * 1000);

    const mark = () => {
      const now = Date.now();
      if (now - lastWrite < ACTIVITY_THROTTLE_MS) return;
      lastWrite = now;
      writeLastActivity(now);
    };
    const onVisible = () => {
      if (document.visibilityState === 'visible') check();
    };

    const events = [
      'pointerdown',
      'keydown',
      'wheel',
      'touchmove',
      'scroll',
    ] as const;
    for (const ev of events) {
      window.addEventListener(ev, mark, { passive: true });
    }
    document.addEventListener('visibilitychange', onVisible);
    const interval = window.setInterval(check, 30 * 1000);

    return () => {
      for (const ev of events) window.removeEventListener(ev, mark);
      document.removeEventListener('visibilitychange', onVisible);
      window.clearInterval(interval);
      window.clearInterval(pingInterval);
    };
  }, [hasSession]);

  const signInWithGoogle = useCallback(async () => {
    await getSupabase().auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/acceso`,
        queryParams: { prompt: 'select_account' },
      },
    });
  }, []);

  const signOut = useCallback(async () => {
    await pingLastSeen();
    await getSupabase().auth.signOut();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      configured: isSupabaseConfigured,
      loading,
      hasSession,
      profile,
      access: resolveAccess({
        configured: isSupabaseConfigured,
        loading,
        hasSession,
        profile,
      }),
      signInWithGoogle,
      signOut,
      refresh: loadProfile,
    }),
    [loading, hasSession, profile, signInWithGoogle, signOut, loadProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
