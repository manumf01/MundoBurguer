import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface RevealProps {
  children: ReactNode;
  /** Retardo en ms para escalonar varios elementos. */
  delay?: number;
  /** Muestra el contenido de inmediato, sin esperar al scroll. */
  forceShow?: boolean;
  className?: string;
}

/**
 * Revela su contenido con un fundido + desplazamiento cuando entra en el
 * viewport al hacer scroll. El `rootMargin` superior enorme hace que cualquier
 * elemento que ya esté visible —o que el scroll ya haya dejado atrás (p. ej.
 * al limpiar un filtro de la carta)— se muestre al instante; solo los que
 * están por debajo del pliegue esperan al scroll.
 */
export function Reveal({
  children,
  delay = 0,
  forceShow = false,
  className,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  const shown = seen || forceShow;

  useEffect(() => {
    if (forceShow) return;
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { rootMargin: '9999px 0px -8% 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [forceShow]);

  return (
    <div
      ref={ref}
      className={cn(
        'transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none',
        shown ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
        className
      )}
      style={{ transitionDelay: shown ? `${delay}ms` : '0ms' }}
    >
      {children}
    </div>
  );
}
