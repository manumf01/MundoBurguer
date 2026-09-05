import { useCallback, useEffect, useRef, useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { cn } from '@/lib/cn';
import { canHover } from '@/lib/pointer';

interface TruncatedTextProps {
  /** Texto completo; se recorta visualmente con `className` (line-clamp-*). */
  text: string;
  /** Debe incluir la utilidad `line-clamp-*` que define el recorte. */
  className?: string;
}

/**
 * Párrafo que se recorta con `line-clamp` y, únicamente cuando el recorte
 * llega a cortar texto de verdad (el contenido no cabe en el alto
 * disponible), se convierte en un disparador accesible que muestra el texto
 * completo en un popover — al pasar el ratón, al tocar o con teclado. Si el
 * texto ya cabe entero, se queda como un párrafo normal, sin nada que lo
 * distinga.
 */
export function TruncatedText({ text, className }: TruncatedTextProps) {
  const [truncated, setTruncated] = useState(false);
  const [open, setOpen] = useState(false);
  const observerRef = useRef<ResizeObserver | null>(null);

  const measure = useCallback((el: HTMLParagraphElement | null) => {
    observerRef.current?.disconnect();
    observerRef.current = null;
    if (!el) return;
    const check = () => setTruncated(el.scrollHeight - el.clientHeight > 1);
    check();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(check);
    ro.observe(el);
    observerRef.current = ro;
  }, []);

  useEffect(() => () => observerRef.current?.disconnect(), []);

  if (!truncated) {
    return (
      <p ref={measure} className={className}>
        {text}
      </p>
    );
  }

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          aria-label={`Ver todos los ingredientes: ${text}`}
          onPointerEnter={(e) => {
            if (canHover() && e.pointerType === 'mouse') setOpen(true);
          }}
          onPointerLeave={(e) => {
            if (canHover() && e.pointerType === 'mouse') setOpen(false);
          }}
          className="block w-full text-left outline-none"
        >
          <p
            ref={measure}
            className={cn(
              className,
              'decoration-cream-mute/50 decoration-dotted underline-offset-4'
            )}
          >
            {text}
          </p>
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          side="top"
          align="start"
          sideOffset={8}
          collisionPadding={16}
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
          className={cn(
            'anim-popover z-50 max-w-[min(20rem,80vw)] rounded-lg border border-hair-strong',
            'bg-bg-elevated px-3.5 py-3 text-left text-sm leading-relaxed text-cream-dim',
            'shadow-[0_12px_30px_-8px_rgba(0,0,0,0.85)]'
          )}
        >
          {text}
          <Popover.Arrow width={12} height={6} className="fill-bg-elevated" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
