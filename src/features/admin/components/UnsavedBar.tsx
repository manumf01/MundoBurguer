import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Save } from 'lucide-react';

/**
 * Barra flotante de «cambios sin guardar» para las vistas del panel con
 * reordenación diferida. Aparece y desaparece con animación; fondo opaco,
 * borde y halo ámbar para que destaque de verdad sobre el contenido.
 *
 * En móvil ocupa todo el ancho, el texto va arriba y los botones abajo a
 * ancho completo; en ≥sm es una sola fila centrada.
 */
export function UnsavedBar({
  show,
  message = 'Tienes cambios sin guardar.',
  saving = false,
  onSave,
  onDiscard,
}: {
  show: boolean;
  message?: string;
  saving?: boolean;
  onSave: () => void;
  onDiscard: () => void;
}) {
  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          role="status"
          initial={{ y: 28, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 28, opacity: 0 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="pointer-events-none sticky bottom-3 z-30 flex justify-center px-2 sm:bottom-4 sm:px-0"
        >
          <div className="pointer-events-auto w-full max-w-2xl rounded-2xl border-2 border-amber bg-bg-elevated p-4 shadow-2xl shadow-black/70 ring-4 ring-amber/20 sm:px-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-amber/15 sm:h-10 sm:w-10">
                  <AlertTriangle
                    size={18}
                    strokeWidth={2.25}
                    className="text-amber"
                    aria-hidden="true"
                  />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold tracking-wide text-cream">
                    Cambios sin guardar
                  </p>
                  <p className="text-xs text-cream-mute">{message}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onDiscard}
                  disabled={saving}
                  className="flex-1 rounded-lg border border-hair px-3 py-2 text-xs font-semibold text-cream-dim transition-colors hover:border-hair-strong hover:text-cream disabled:opacity-40 sm:flex-none"
                >
                  Descartar
                </button>
                <button
                  type="button"
                  onClick={onSave}
                  disabled={saving}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-amber px-3.5 py-2 text-xs font-bold text-bg transition-colors hover:bg-amber-bright disabled:opacity-50 sm:flex-none"
                >
                  <Save size={14} aria-hidden="true" />
                  {saving ? 'Guardando…' : 'Guardar cambios'}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
