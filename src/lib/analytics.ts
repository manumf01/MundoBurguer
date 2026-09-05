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
}

export function trackPageView(path: string) {
  if (!scriptRequested) return;
  gtag('event', 'page_view', { page_path: path });
}

/** Borra las cookies de Google Analytics del navegador al revocar el consentimiento. */
export function clearAnalyticsCookies() {
  const host = window.location.hostname;
  const expire = 'expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';

  document.cookie.split(';').forEach((entry) => {
    const name = entry.split('=')[0]?.trim();
    if (!name || !name.startsWith('_ga')) return;
    document.cookie = `${name}=; ${expire}`;
    document.cookie = `${name}=; ${expire}; domain=${host}`;
    document.cookie = `${name}=; ${expire}; domain=.${host}`;
  });
}
