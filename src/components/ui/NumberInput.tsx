import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/cn';

/**
 * Campo numérico horizontal (estilo Untitled UI): botón «−», valor editable
 * y botón «+» en un mismo grupo. El valor se maneja como string (coma decimal)
 * para encajar con los formularios controlados del panel.
 *
 * - `decimals={2}`: dinero, formato `XX,XX` (máx. 2 enteros).
 * - `decimals={0}`: enteros (p. ej. piezas).
 */
export function NumberInput({
  value,
  onValueChange,
  min,
  max,
  step = 1,
  decimals = 0,
  allowNegative = false,
  placeholder,
  id,
  ariaLabel,
  disabled,
  className,
}: {
  value: string;
  onValueChange: (value: string) => void;
  min?: number;
  max?: number;
  step?: number;
  decimals?: 0 | 2;
  /** Permite teclear un signo `-` inicial (para descuentos). Solo con `decimals=2`. */
  allowNegative?: boolean;
  placeholder?: string;
  id?: string;
  ariaLabel?: string;
  disabled?: boolean;
  className?: string;
}) {
  const parse = (s: string): number | null => {
    const n = Number(s.trim().replace(',', '.'));
    return Number.isFinite(n) ? n : null;
  };

  const format = (n: number): string =>
    decimals === 2 ? n.toFixed(2).replace('.', ',') : String(Math.round(n));

  const clamp = (n: number): number => {
    let r = n;
    if (min != null && r < min) r = min;
    if (max != null && r > max) r = max;
    return r;
  };

  const sanitize = (raw: string): string => {
    if (decimals === 2) {
      let c = raw.replace(/[^\d.,-]/g, '').replace('.', ',');
      if (allowNegative) {
        const neg = c.startsWith('-');
        c = (neg ? '-' : '') + c.replace(/-/g, '');
      } else {
        c = c.replace(/-/g, '');
      }
      if (c === '' || c === '-') return c;
      const re = allowNegative
        ? /^-?\d{1,4}(,\d{0,2})?$/
        : /^\d{1,4}(,\d{0,2})?$/;
      return re.test(c) ? c : value;
    }
    const digits = raw.replace(/\D/g, '');
    const maxLen = max != null ? String(Math.floor(Math.abs(max))).length : 3;
    return digits.slice(0, maxLen);
  };

  const bump = (dir: 1 | -1) => {
    const base = parse(value) ?? 0;
    onValueChange(format(clamp(base + dir * step)));
  };

  const current = parse(value);
  const atMin = current != null && min != null && current <= min;
  const atMax = current != null && max != null && current >= max;

  return (
    <div
      className={cn(
        'inline-flex h-11 items-stretch overflow-hidden rounded-xl border border-hair bg-white/5',
        disabled && 'pointer-events-none opacity-60',
        className
      )}
    >
      <button
        type="button"
        aria-label="Restar"
        tabIndex={-1}
        onClick={() => bump(-1)}
        disabled={disabled || atMin}
        className="grid w-11 shrink-0 place-items-center border-r border-hair text-cream-mute transition-colors hover:bg-white/5 hover:text-cream disabled:opacity-30 disabled:hover:bg-transparent"
      >
        <Minus size={15} aria-hidden="true" />
      </button>
      <input
        id={id}
        aria-label={ariaLabel}
        inputMode="decimal"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onValueChange(sanitize(e.target.value))}
        onBlur={(e) => {
          const n = parse(e.target.value);
          if (n != null) onValueChange(format(clamp(n)));
        }}
        className="min-w-0 flex-1 bg-transparent px-2 text-center text-sm text-cream placeholder:text-cream-mute focus-visible:outline-none"
      />
      <button
        type="button"
        aria-label="Sumar"
        tabIndex={-1}
        onClick={() => bump(1)}
        disabled={disabled || atMax}
        className="grid w-11 shrink-0 place-items-center border-l border-hair text-cream-mute transition-colors hover:bg-white/5 hover:text-cream disabled:opacity-30 disabled:hover:bg-transparent"
      >
        <Plus size={15} aria-hidden="true" />
      </button>
    </div>
  );
}
