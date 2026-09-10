import { createContext, useContext } from 'react';

export interface ConsentChoices {
  analytics: boolean;
  maps: boolean;
}

export interface CookieConsentContextValue {
  /** null mientras la persona usuaria no ha decidido nada todavía. */
  consent: ConsentChoices | null;
  hasDecided: boolean;
  isPanelOpen: boolean;
  acceptAll: () => void;
  rejectAll: () => void;
  savePreferences: (choices: ConsentChoices) => void;
  openPanel: () => void;
  closePanel: () => void;
}

export const CookieConsentContext =
  createContext<CookieConsentContextValue | null>(null);

/** Acceso al consentimiento de cookies. Requiere `<CookieConsentProvider>`. */
export function useCookieConsent(): CookieConsentContextValue {
  const ctx = useContext(CookieConsentContext);
  if (!ctx) {
    throw new Error(
      'useCookieConsent debe usarse dentro de <CookieConsentProvider>'
    );
  }
  return ctx;
}
