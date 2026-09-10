import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useInView } from 'react-intersection-observer';
import { cn } from '@/lib/cn';

interface RevealProps {
  children: ReactNode;
  /** Retardo en ms para escalonar varios elementos. */
  delay?: number;
  /** Muestra el contenido de inmediato, sin esperar al scroll. */
  forceShow?: boolean;
  className?: string;
}

/** Píxeles que el elemento debe asomar por debajo del pliegue para revelarse. */
const REVEAL_MARGIN_PX = 80;

/* ---------------------------------------------------------------------------
 * Registro compartido de comprobaciones de posición.
 *
 * Cada <Reveal> aún sin revelar registra aquí un callback. Un ÚNICO juego de
 * listeners de ventana los ejecuta a todos, agrupados en un
 * requestAnimationFrame, así que scrollear la carta (100+ instancias) hace una
 * sola lectura de layout por frame en lugar de una por instancia. Al revelarse,
 * la instancia se da de baja.
 *
 * Existe solo para cubrir el retraso del primer callback del
 * IntersectionObserver en Safari iOS al cargar en frío; el observer de
 * react-intersection-observer sigue siendo la vía principal.
 * ------------------------------------------------------------------------- */
const positionChecks = new Set<() => void>();
let rafHandle = 0;
let windowListening = false;

function runPositionChecks() {
  rafHandle = 0;
  for (const check of positionChecks) check();
}

function schedulePositionChecks() {
  if (rafHandle || positionChecks.size === 0 || typeof window === 'undefined') {
    return;
  }
  rafHandle = window.requestAnimationFrame(runPositionChecks);
}

function ensureWindowListening() {
  if (windowListening || typeof window === 'undefined') return;
  windowListening = true;
  const passive = { passive: true } as const;
  window.addEventListener('scroll', schedulePositionChecks, passive);
  window.addEventListener('resize', schedulePositionChecks, passive);
  window.addEventListener('orientationchange', schedulePositionChecks);
  window.addEventListener('load', schedulePositionChecks);
  window.addEventListener('pageshow', schedulePositionChecks);
}

/** `prefers-reduced-motion`, reactivo al cambio del ajuste del sistema. */
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
  );

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return reduced;
}

/**
 * Revela su contenido con un fundido + desplazamiento cuando entra en el
 * viewport al hacer scroll.
 *
 *  - `useInView` de react-intersection-observer: vía principal, con pooling de
 *    observers y `fallbackInView` para navegadores sin soporte.
 *  - Comprobación de posición compartida (arriba): revela de inmediato lo que
 *    ya está en pantalla, reevaluando tras pintar, en `load`, cuando las
 *    fuentes están listas y al restaurar desde bfcache. Cubre el retraso del
 *    primer callback del observer en Safari iOS al cargar en frío (con
 *    navegación del router no ocurre porque el documento ya está "caliente").
 */
export function Reveal({
  children,
  delay = 0,
  forceShow = false,
  className,
}: RevealProps) {
  const { ref: inViewRef, inView } = useInView({
    triggerOnce: true,
    rootMargin: `0px 0px -${REVEAL_MARGIN_PX}px 0px`,
    fallbackInView: true,
  });

  const nodeRef = useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  const shown = forceShow || reducedMotion || inView || ready;

  useEffect(() => {
    if (forceShow || reducedMotion || ready || inView) return;
    const el = nodeRef.current;
    if (!el) return;

    let done = false;
    const check = () => {
      if (done) return;
      const vh = window.innerHeight || document.documentElement.clientHeight;
      if (el.getBoundingClientRect().top <= vh - REVEAL_MARGIN_PX) {
        done = true;
        positionChecks.delete(check);
        setReady(true);
      }
    };

    positionChecks.add(check);
    ensureWindowListening();
    schedulePositionChecks();

    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(schedulePositionChecks)
    );
    document.fonts?.ready.then(schedulePositionChecks).catch(() => {});

    return () => {
      done = true;
      positionChecks.delete(check);
      cancelAnimationFrame(raf);
    };
  }, [forceShow, reducedMotion, ready, inView]);

  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      nodeRef.current = node;
      inViewRef(node);
    },
    [inViewRef]
  );

  return (
    <div
      ref={setRefs}
      className={cn(
        'transition-[opacity,transform] duration-500 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none',
        shown ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
        className
      )}
      style={{ transitionDelay: shown ? `${delay}ms` : '0ms' }}
    >
      {children}
    </div>
  );
}
