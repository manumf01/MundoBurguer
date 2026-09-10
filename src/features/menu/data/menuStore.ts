import type { MenuData } from '../types';
import { fetchMenu, menuBackendConfigured } from '../api/menuApi';
import snapshotJson from './menu.snapshot.json';

/**
 * Estrategia: en **cada carga de página** se revalida contra el backend (así
 * un cambio del panel se ve recargando UNA vez). Dentro de la misma sesión,
 * al navegar entre páginas de la SPA, solo se vuelve a pedir si el dato lleva
 * más de `DEDUPE_MS` (evita ráfagas de peticiones).
 */
const DEDUPE_MS = 20 * 1000;
// Súbelo cuando cambie la FORMA de MenuData, para invalidar cachés antiguas.
const LS_KEY = 'mb.menu.v4';

/**
 * Snapshot incluido en el build: último recurso si el backend no responde.
 * El `cast` es seguro: el fichero lo genera `scripts/gen-menu-snapshot.mjs`
 * con esta forma exacta (más `generatedAt`, que aquí se ignora).
 */
const SNAPSHOT = snapshotJson as unknown as MenuData;

export type MenuSource = 'snapshot' | 'cache' | 'network';

export interface MenuState {
  data: MenuData;
  source: MenuSource;
  /** epoch ms del último fetch al backend; `null` = viene del snapshot. */
  fetchedAt: number | null;
}

// Referencia ESTABLE del estado "snapshot": así, si una revalidación fallida
// devuelve el snapshot, `setState` recibe el mismo objeto y React no re-renderiza
// → no hay bucle de reintentos.
const SNAPSHOT_STATE: MenuState = {
  data: SNAPSHOT,
  source: 'snapshot',
  fetchedAt: null,
};

let mem: MenuState | null = null;
let inFlight: Promise<MenuState> | null = null;
/** ¿Ya se ha traído del backend en esta carga de página? */
let fetchedThisPageLoad = false;

function readLs(): MenuState | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { data?: MenuData; at?: number };
    if (
      !parsed.data ||
      !Array.isArray(parsed.data.products) ||
      !Array.isArray(parsed.data.categories) ||
      !Array.isArray(parsed.data.menuConfig?.groups) ||
      typeof parsed.at !== 'number'
    ) {
      return null;
    }
    return { data: parsed.data, source: 'cache', fetchedAt: parsed.at };
  } catch {
    return null;
  }
}

function writeLs(data: MenuData, at: number) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({ data, at }));
  } catch {
    // Almacenamiento no disponible (navegación privada, cuota…): sin caché.
  }
}

/** Mejor dato disponible ahora mismo, sin tocar la red. */
export function peekMenu(): MenuState {
  if (mem) return mem;
  const ls = readLs();
  if (ls) {
    mem = ls;
    return ls;
  }
  return SNAPSHOT_STATE;
}

function isFresh(state: MenuState): boolean {
  return state.fetchedAt !== null && Date.now() - state.fetchedAt < DEDUPE_MS;
}

/**
 * ¿Debe `useMenuData` revalidar al montar? Siempre en la primera carga de la
 * página; después (navegación interna) solo si el dato ya no es reciente.
 */
export function shouldRevalidate(state: MenuState): boolean {
  return !fetchedThisPageLoad || !isFresh(state);
}

/**
 * Revalida contra el backend. Concurrencia coalescida (una sola petición en
 * vuelo). Si falla o no hay backend, devuelve lo que hubiera (caché o
 * snapshot, con referencia estable) sin propagar el error.
 */
export function revalidateMenu(): Promise<MenuState> {
  if (inFlight) return inFlight;
  inFlight = (async () => {
    try {
      if (!menuBackendConfigured) return peekMenu();
      const data = await fetchMenu();
      const at = Date.now();
      mem = { data, source: 'network', fetchedAt: at };
      fetchedThisPageLoad = true;
      writeLs(data, at);
      return mem;
    } catch {
      return peekMenu();
    } finally {
      inFlight = null;
    }
  })();
  return inFlight;
}

/** Solo para tests. */
export function __resetMenuStore() {
  mem = null;
  inFlight = null;
  fetchedThisPageLoad = false;
}
