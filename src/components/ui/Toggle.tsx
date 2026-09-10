import { cn } from '@/lib/cn';

/**
 * Interruptor (estilo Untitled UI): pastilla con pulgar deslizante. Sustituye
 * a los checkbox en los formularios del panel. Accesible: `role="switch"` +
 * `aria-checked`, el texto visible es el propio contenido del botón.
 */
export function Toggle({
  checked,
  onCheckedChange,
  label,
  hint,
  id,
  disabled,
  size = 'md',
  className,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  hint?: string;
  id?: string;
  disabled?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}) {
  const track = size === 'sm' ? 'h-5 w-9' : 'h-6 w-11';
  const knob = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
  const shift = size === 'sm' ? 'translate-x-4' : 'translate-x-5';

  return (
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        'group flex items-center gap-3 text-left disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
    >
      <span
        className={cn(
          'relative inline-flex shrink-0 items-center rounded-full border transition-colors duration-200',
          'group-focus-visible:outline group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-amber/60',
          track,
          checked ? 'border-amber bg-amber' : 'border-hair bg-white/10'
        )}
      >
        <span
          className={cn(
            'inline-block transform rounded-full bg-white shadow-sm transition-transform duration-200 motion-reduce:transition-none',
            knob,
            checked ? shift : 'translate-x-0.5'
          )}
        />
      </span>
      {label ? (
        <span className="flex min-w-0 flex-col">
          <span className="text-sm text-cream">{label}</span>
          {hint ? (
            <span className="text-xs text-cream-mute">{hint}</span>
          ) : null}
        </span>
      ) : null}
    </button>
  );
}
