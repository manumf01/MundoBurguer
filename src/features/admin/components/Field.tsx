import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export const inputClass =
  'h-11 w-full rounded-xl border border-hair bg-white/5 px-3 text-sm text-cream placeholder:text-cream-mute focus-visible:border-amber/60 focus-visible:outline-none disabled:opacity-60';

export const textareaClass =
  'w-full rounded-xl border border-hair bg-white/5 px-3 py-2 text-sm leading-relaxed text-cream placeholder:text-cream-mute focus-visible:border-amber/60 focus-visible:outline-none';

export function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label
        htmlFor={htmlFor}
        className="block text-sm font-semibold text-cream"
      >
        {label}
      </label>
      {hint ? <p className="mt-0.5 text-xs text-cream-mute">{hint}</p> : null}
      <div className="mt-1.5">{children}</div>
      {error ? <p className="mt-1 text-xs text-brand-light">{error}</p> : null}
    </div>
  );
}

export function TagPicker<T extends string>({
  options,
  value,
  onChange,
  lockedIds = [],
}: {
  options: { id: T; label: string }[];
  value: T[];
  onChange: (next: T[]) => void;
  /** Tags que se muestran siempre marcados y no se pueden desmarcar. */
  lockedIds?: T[];
}) {
  const locked = new Set<T>(lockedIds);
  const toggle = (id: T) => {
    if (locked.has(id)) return;
    onChange(
      value.includes(id) ? value.filter((x) => x !== id) : [...value, id]
    );
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const isLocked = locked.has(o.id);
        const on = isLocked || value.includes(o.id);
        return (
          <button
            key={o.id}
            type="button"
            aria-pressed={on}
            disabled={isLocked}
            title={
              isLocked
                ? 'Se aplica automáticamente por la categoría'
                : undefined
            }
            onClick={() => toggle(o.id)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
              on
                ? 'border-amber bg-amber/15 text-cream'
                : 'border-hair bg-white/5 text-cream-mute hover:text-cream-dim',
              isLocked && 'cursor-not-allowed opacity-70'
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
