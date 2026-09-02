/**
 * Feature flags. La web es hoy informativa; estos interruptores dejan
 * preparado el camino para pedidos y reservas sin reescribir la arquitectura.
 *
 * Al activar uno, añade su ruta en src/app/router.tsx (ya está previsto el
 * bloque condicionado) y crea el feature correspondiente en src/features/.
 */
export const features = {
  /** Carrito + checkout online. */
  onlineOrdering: false,
  /** Reserva de mesa. */
  reservations: false,
  /** Formulario de contacto con envío real de email. */
  contactForm: false,
} as const;

export type FeatureName = keyof typeof features;

export const isEnabled = (name: FeatureName): boolean => features[name];
