/**
 * Carga diferida de Google Analytics 4 (gtag.js), gateada por el consentimiento
 * de cookies del banner (ver src/lib/cookieConsent.tsx). El script NUNCA se
 * inserta en el DOM hasta que la persona usuaria acepta la categoría
 * "Análisis"; antes de eso solo se declara el consentimiento por defecto
 * (Google Consent Mode v2), como exige Google para tráfico del EEE.
 */

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let scriptRequested = false;
/**
 * Ruta de una vista de página pedida ANTES de que el script existiera. Pasa
 * porque los efectos de React corren de hijo a padre: `AnalyticsPageViewTracker`
 * (hijo, en Layout) llama a `trackPageView` antes de que el efecto de
 * `CookieConsentProvider` (padre) ejecute `loadGoogleAnalytics`. Sin esto, en
 * una recarga con el consentimiento ya concedido se perdía la vista de entrada.
 */
let queuedPath: string | null = null;

function gtag(...args: unknown[]) {
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(args);
}

/** Declara consentimiento denegado por defecto antes de que el usuario decida. */
export function initGoogleConsentMode() {
  window.dataLayer = window.dataLayer ?? [];
  gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  });
}

export function setAnalyticsConsent(granted: boolean) {
  gtag('consent', 'update', {
    analytics_storage: granted ? 'granted' : 'denied',
  });
}

/** Inserta gtag.js una única vez. Idempotente: llamadas repetidas no hacen nada. */
export function loadGoogleAnalytics(measurementId: string) {
  if (scriptRequested || !measurementId) return;
  scriptRequested = true;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  gtag('js', new Date());
  // send_page_view: false — las vistas se envían manualmente en cada
  // navegación del router (ver AnalyticsPageViewTracker en Layout.tsx),
  // porque es una SPA y gtag no detecta los cambios de ruta por sí solo.
  gtag('config', measurementId, { send_page_view: false });

  // Vista de entrada pedida antes de tiempo (ver `queuedPath`).
  if (queuedPath !== null) {
    gtag('event', 'page_view', { page_path: queuedPath });
    queuedPath = null;
  }
}

export function trackPageView(path: string) {
  if (!scriptRequested) {
    queuedPath = path;
    return;
  }
  gtag('event', 'page_view', { page_path: path });
}

/** Borra las cookies de Google Analytics del navegador al revocar el consentimiento. */
export function clearAnalyticsCookies() {
  const expire = 'expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';

  // GA fija `_ga*` en el dominio registrable con punto inicial
  // (p. ej. ".mundoburguer.es"), NO en el host completo ("www.mundoburguer.es").
  // Para borrarlas hay que reintentar contra el host y cada dominio padre.
  const labels = window.location.hostname.split('.');
  const domains = new Set<string>(['']); // '' = sin atributo domain (host actual)
  for (let i = 0; i + 1 < labels.length; i++) {
    const d = labels.slice(i).join('.');
    domains.add(d);
    domains.add(`.${d}`);
  }

  document.cookie.split(';').forEach((entry) => {
    const name = entry.split('=')[0]?.trim();
    if (!name || !(name.startsWith('_ga') || name === '_gid')) return;
    for (const d of domains) {
      document.cookie = d
        ? `${name}=; ${expire}; domain=${d}`
        : `${name}=; ${expire}`;
    }
  });
}
