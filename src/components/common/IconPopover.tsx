import { useState, type ReactNode } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { cn } from '@/lib/cn';
import { canHover } from '@/lib/pointer';

interface IconPopoverProps {
  /** Texto a mostrar (nombre del alérgeno o de la verdura). */
  label: string;
  /** Insignia visual del icono. */
  children: ReactNode;
  className?: string;
}

/**
 * Envuelve una insignia de icono y muestra su nombre en un popover:
 * al pasar el ratón (escritorio) o al tocar con el dedo (móvil).
 * Posicionado con Radix (evita salirse de la pantalla); la animación de
 * entrada/salida está en `.anim-popover` (src/styles/index.css).
 */
export function IconPopover({ label, children, className }: IconPopoverProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          // Fuera del orden de tabulación: en la carta hay cientos de iconos y
          // la lista de alérgenos ya se anuncia en el aria-label de cada fila.
          tabIndex={-1}
          aria-label={label}
          onPointerEnter={(e) => {
            if (canHover() && e.pointerType === 'mouse') setOpen(true);
          }}
          onPointerLeave={(e) => {
            if (canHover() && e.pointerType === 'mouse') setOpen(false);
          }}
          className={cn(
            'inline-flex rounded-full outline-none transition-transform active:scale-90',
            className
          )}
        >
          {children}
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          side="top"
          align="center"
          sideOffset={7}
          collisionPadding={12}
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
          className={cn(
            'anim-popover z-50 select-none rounded-lg border border-hair-strong',
            'bg-bg-elevated px-2.5 py-1.5 text-xs font-semibold tracking-wide text-cream',
            'shadow-[0_12px_30px_-8px_rgba(0,0,0,0.85)]'
          )}
        >
          {label}
          <Popover.Arrow width={12} height={6} className="fill-bg-elevated" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
