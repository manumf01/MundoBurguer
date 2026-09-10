import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Cookie, X } from 'lucide-react';
import { useCookieConsent } from '@/lib/cookieConsentContext';
import { Button, Container } from '@/components/ui';

function ConsentCheckbox({
  id,
  label,
  description,
  checked,
  disabled,
  onChange,
}: {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
}) {
  const descId = `${id}-desc`;
  return (
    <div className="rounded-xl border border-hair p-4">
      <label htmlFor={id} className="flex items-start gap-3">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange?.(e.target.checked)}
          aria-describedby={descId}
          className="mt-1 h-4 w-4 shrink-0 accent-amber"
        />
        <span className="font-semibold text-cream">{label}</span>
      </label>
      <p id={descId} className="mt-1 pl-7 text-sm text-cream-dim">
        {description}
      </p>
    </div>
  );
}

/**
 * Banner de cookies (primera capa) + panel de configuración granular
 * (segunda capa, Radix Dialog). "Aceptar" y "Rechazar" van al mismo nivel de
 * visibilidad en ambas capas, sin casillas premarcadas, tal y como exige la
 * guía de cookies de la AEPD.
 */
export function CookieConsentBanner() {
  const {
    consent,
    hasDecided,
    isPanelOpen,
    acceptAll,
    rejectAll,
    savePreferences,
    openPanel,
    closePanel,
  } = useCookieConsent();

  const [draft, setDraft] = useState<{ analytics: boolean; maps: boolean }>({
    analytics: consent?.analytics ?? false,
    maps: consent?.maps ?? false,
  });

  // Cada vez que el panel pasa a abierto, el borrador se resincroniza con el
  // consentimiento guardado. Se ajusta durante el render (patrón recomendado
  // por React para "resetear estado al cambiar una prop") en vez de un
  // useEffect, para evitar una vuelta de render extra.
  const [wasPanelOpen, setWasPanelOpen] = useState(isPanelOpen);
  if (isPanelOpen !== wasPanelOpen) {
    setWasPanelOpen(isPanelOpen);
    if (isPanelOpen) {
      setDraft({
        analytics: consent?.analytics ?? false,
        maps: consent?.maps ?? false,
      });
    }
  }

  return (
    <>
      <AnimatePresence>
        {!hasDecided ? (
          <motion.div
            role="region"
            aria-label="Uso de cookies"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-x-0 bottom-0 z-40 border-t border-hair-strong bg-bg-elevated/97 backdrop-blur-md"
          >
            <Container className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3 sm:max-w-xl">
                <Cookie
                  className="mt-0.5 shrink-0 text-amber"
                  size={22}
                  aria-hidden="true"
                />
                <p className="text-sm text-cream-dim">
                  Usamos cookies propias necesarias y, si nos das permiso,
                  cookies de análisis (Google Analytics) y del mapa de Google
                  Maps. Puedes aceptarlas, rechazarlas o configurarlas.{' '}
                  <Link to="/politica-cookies">Más información</Link>
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={openPanel}
                >
                  Configurar
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={rejectAll}
                >
                  Rechazar todo
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={acceptAll}
                >
                  Aceptar todo
                </Button>
              </div>
            </Container>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <Dialog.Root
        open={isPanelOpen}
        onOpenChange={(open) => (open ? openPanel() : closePanel())}
      >
        <AnimatePresence>
          {isPanelOpen ? (
            <Dialog.Portal forceMount>
              <Dialog.Overlay asChild forceMount>
                <motion.div
                  className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                />
              </Dialog.Overlay>
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <Dialog.Content
                  asChild
                  forceMount
                  aria-describedby="cookie-panel-desc"
                >
                  <motion.div
                    className="max-h-[90vh] w-[min(32rem,92vw)] overflow-y-auto rounded-2xl border border-hair-strong bg-bg-elevated p-6 shadow-2xl sm:p-8"
                    initial={{ opacity: 0, scale: 0.95, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 12 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <Dialog.Title className="text-heat text-xl">
                        Preferencias de cookies
                      </Dialog.Title>
                      <Dialog.Close asChild>
                        <button
                          type="button"
                          aria-label="Cerrar"
                          className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-hair-strong text-cream"
                        >
                          <X size={16} aria-hidden="true" />
                        </button>
                      </Dialog.Close>
                    </div>
                    <p
                      id="cookie-panel-desc"
                      className="mt-2 text-sm text-cream-dim"
                    >
                      Elige qué cookies no esenciales quieres permitir. Puedes
                      cambiarlas cuando quieras desde la Política de cookies.
                    </p>

                    <div className="mt-6 flex flex-col gap-4">
                      <ConsentCheckbox
                        id="cookie-cat-necessary"
                        label="Necesarias"
                        description="Recuerdan tu elección sobre cookies en este navegador. Siempre activas: no requieren consentimiento."
                        checked
                        disabled
                      />
                      <ConsentCheckbox
                        id="cookie-cat-analytics"
                        label="Análisis (Google Analytics)"
                        description="Nos ayuda a saber cuánta gente visita la web y qué páginas ve. Proveedor: Google Ireland Ltd. Detalle en la Política de cookies."
                        checked={draft.analytics}
                        onChange={(checked) =>
                          setDraft((d) => ({ ...d, analytics: checked }))
                        }
                      />
                      <ConsentCheckbox
                        id="cookie-cat-maps"
                        label="Mapa (Google Maps)"
                        description="Muestra el mapa interactivo de nuestra ubicación en Contacto. Si no lo activas, te ofrecemos un enlace directo a Google Maps."
                        checked={draft.maps}
                        onChange={(checked) =>
                          setDraft((d) => ({ ...d, maps: checked }))
                        }
                      />
                    </div>

                    <div className="mt-8 flex flex-wrap justify-end gap-2.5">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={rejectAll}
                      >
                        Rechazar todo
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => savePreferences(draft)}
                      >
                        Guardar preferencias
                      </Button>
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={acceptAll}
                      >
                        Aceptar todo
                      </Button>
                    </div>
                  </motion.div>
                </Dialog.Content>
              </div>
            </Dialog.Portal>
          ) : null}
        </AnimatePresence>
      </Dialog.Root>
    </>
  );
}
