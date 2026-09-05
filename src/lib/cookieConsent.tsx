import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { site } from '@/config/site';
import {
  clearAnalyticsCookies,
  initGoogleConsentMode,
  loadGoogleAnalytics,
  setAnalyticsConsent,
} from './analytics';

const STORAGE_KEY = 'mb-cookie-consent';
/** Súbelo si cambian las categorías: fuerza a volver a preguntar a todo el mundo. */
const CONSENT_VERSION = 1;

export interface ConsentChoices {
  analytics: boolean;
  maps: boolean;
}

interface StoredConsent extends ConsentChoices {
  version: number;
  decidedAt: string;
}

interface CookieConsentContextValue {
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

const CookieConsentContext = createContext<CookieConsentContextValue | null>(
  null
);

function readStoredConsent(): StoredConsent | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredConsent>;
    if (parsed.version !== CONSENT_VERSION) return null;
    if (
      typeof parsed.analytics !== 'boolean' ||
      typeof parsed.maps !== 'boolean'
    ) {
      return null;
    }
    return parsed as StoredConsent;
  } catch {
    return null;
  }
}

function writeStoredConsent(choices: ConsentChoices) {
  const record: StoredConsent = {
    ...choices,
    version: CONSENT_VERSION,
    decidedAt: new Date().toISOString(),
  };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  } catch {
    // Almacenamiento no disponible (navegación privada, cuotas, etc.): la
    // elección solo dura mientras esta pestaña siga abierta.
  }
}

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(() => readStoredConsent());
  const [consent, setConsent] = useState<ConsentChoices | null>(
    initial ? { analytics: initial.analytics, maps: initial.maps } : null
  );
  const [hasDecided, setHasDecided] = useState(initial !== null);
  const [isPanelOpen, setPanelOpen] = useState(false);

  useEffect(() => {
    initGoogleConsentMode();
  }, []);

  useEffect(() => {
    if (!consent) return;
    setAnalyticsConsent(consent.analytics);
    if (consent.analytics && site.legal.ga.measurementId) {
      loadGoogleAnalytics(site.legal.ga.measurementId);
    } else {
      clearAnalyticsCookies();
    }
  }, [consent]);

  const apply = (choices: ConsentChoices) => {
    setConsent(choices);
    setHasDecided(true);
    setPanelOpen(false);
    writeStoredConsent(choices);
  };

  const value: CookieConsentContextValue = {
    consent,
    hasDecided,
    isPanelOpen,
    acceptAll: () => apply({ analytics: true, maps: true }),
    rejectAll: () => apply({ analytics: false, maps: false }),
    savePreferences: apply,
    openPanel: () => setPanelOpen(true),
    closePanel: () => setPanelOpen(false),
  };

  return (
    <CookieConsentContext.Provider value={value}>
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent(): CookieConsentContextValue {
  const ctx = useContext(CookieConsentContext);
  if (!ctx) {
    throw new Error(
      'useCookieConsent debe usarse dentro de <CookieConsentProvider>'
    );
  }
  return ctx;
}
