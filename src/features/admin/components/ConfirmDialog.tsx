import type { ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Button } from '@/components/ui';

/**
 * Modal de confirmación para acciones peligrosas (eliminar). Radix Dialog:
 * foco atrapado, cierre con Escape y overlay, accesible.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Eliminar',
  busyLabel = 'Eliminando…',
  onConfirm,
  busy = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  busyLabel?: string;
  onConfirm: () => void;
  busy?: boolean;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <Dialog.Content className="anim-popover fixed left-1/2 top-1/2 z-50 w-[min(28rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-hair bg-bg-elevated p-6 shadow-2xl">
          <Dialog.Title className="font-display text-xl tracking-wide text-cream">
            {title}
          </Dialog.Title>
          <Dialog.Description asChild>
            <div className="mt-2 text-sm leading-relaxed text-cream-dim">
              {description}
            </div>
          </Dialog.Description>
          <div className="mt-6 flex justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="solidRed"
              size="sm"
              onClick={onConfirm}
              disabled={busy}
            >
              {busy ? busyLabel : confirmLabel}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
