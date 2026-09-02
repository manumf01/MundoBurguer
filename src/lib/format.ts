/**
 * Formatea un importe como moneda.
 * @example formatPrice(9.9) => "9,90 €"
 */
export function formatPrice(
  amount: number,
  {
    locale = 'es-ES',
    currency = 'EUR',
  }: { locale?: string; currency?: string } = {}
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formatea un incremento de precio con signo.
 * @example formatDelta(0.5) => "+0,50 €"
 */
export function formatDelta(amount: number): string {
  const sign = amount > 0 ? '+' : amount < 0 ? '−' : '';
  return `${sign}${formatPrice(Math.abs(amount))}`;
}

/** Normaliza un teléfono de display a formato tel: (E.164 si empieza por +). */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}
