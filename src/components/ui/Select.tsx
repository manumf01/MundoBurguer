import * as RSelect from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface SelectOption {
  value: string;
  label: string;
}

/**
 * Desplegable con la estética de la web (no el nativo del navegador): mismo
 * fondo, hover ámbar y tipografía que el resto de controles. Sobre Radix
 * Select: teclado, foco atrapado y accesible.
 */
export function Select({
  value,
  onValueChange,
  options,
  placeholder = 'Selecciona…',
  id,
  disabled,
  ariaLabel,
  className,
}: {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  id?: string;
  disabled?: boolean;
  ariaLabel?: string;
  className?: string;
}) {
  return (
    <RSelect.Root
      value={value || undefined}
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <RSelect.Trigger
        id={id}
        aria-label={ariaLabel}
        className={cn(
          'inline-flex h-11 w-full items-center justify-between gap-2 rounded-xl border border-hair bg-white/5 px-3 text-sm text-cream transition-colors',
          'data-[placeholder]:text-cream-mute hover:border-amber/40',
          'focus-visible:border-amber/60 focus-visible:outline-none',
          'disabled:pointer-events-none disabled:opacity-60',
          className
        )}
      >
        <RSelect.Value placeholder={placeholder} />
        <RSelect.Icon>
          <ChevronDown
            size={16}
            className="text-cream-mute"
            aria-hidden="true"
          />
        </RSelect.Icon>
      </RSelect.Trigger>

      <RSelect.Portal>
        <RSelect.Content
          position="popper"
          sideOffset={6}
          className={cn(
            'anim-popover z-50 overflow-hidden rounded-xl border border-hair-strong bg-bg-elevated shadow-2xl',
            'max-h-[min(18rem,var(--radix-select-content-available-height))] w-[var(--radix-select-trigger-width)]'
          )}
        >
          <RSelect.Viewport className="p-1">
            {options.map((o) => (
              <RSelect.Item
                key={o.value}
                value={o.value}
                className={cn(
                  'relative flex cursor-pointer select-none items-center rounded-lg py-2 pl-8 pr-3 text-sm text-cream-dim outline-none',
                  'data-[highlighted]:bg-amber/15 data-[highlighted]:text-cream data-[state=checked]:text-cream'
                )}
              >
                <RSelect.ItemIndicator className="absolute left-2 inline-flex">
                  <Check size={14} className="text-amber" aria-hidden="true" />
                </RSelect.ItemIndicator>
                <RSelect.ItemText>{o.label}</RSelect.ItemText>
              </RSelect.Item>
            ))}
          </RSelect.Viewport>
        </RSelect.Content>
      </RSelect.Portal>
    </RSelect.Root>
  );
}
