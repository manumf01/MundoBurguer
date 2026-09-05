import { useEffect, useState } from 'react';

/** Breakpoints de Tailwind usados por las cuadrículas de la carta. */
const BP_SM = '(min-width: 40rem)'; // sm
const BP_LG = '(min-width: 64rem)'; // lg

export interface GridColumnsConfig {
  /** Columnas por defecto (sin prefijo de breakpoint). */
  base: number;
  /** Columnas a partir de `sm:`. */
  sm?: number;
  /** Columnas a partir de `lg:`. */
  lg?: number;
}

/**
 * Número de columnas que tiene AHORA MISMO una cuadrícula responsive del
 * tipo `grid-cols-{base} sm:grid-cols-{sm} lg:grid-cols-{lg}`, recalculado
 * cuando cambia el ancho de la ventana. Sirve para saber qué productos caen
 * juntos en la misma fila visual en cada momento (ver `chunkIntoRows` en
 * `src/features/menu/utils.ts`), y así decidir fila a fila si hace falta
 * reservar hueco para la descripción o los alérgenos.
 */
export function useGridColumns({ base, sm, lg }: GridColumnsConfig): number {
  const resolve = () => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return base;
    }
    if (lg && window.matchMedia(BP_LG).matches) return lg;
    if (sm && window.matchMedia(BP_SM).matches) return sm;
    return base;
  };

  const [columns, setColumns] = useState(resolve);

  useEffect(() => {
    const mqSm = window.matchMedia(BP_SM);
    const mqLg = window.matchMedia(BP_LG);
    const update = () => setColumns(resolve());
    update();
    mqSm.addEventListener('change', update);
    mqLg.addEventListener('change', update);
    return () => {
      mqSm.removeEventListener('change', update);
      mqLg.removeEventListener('change', update);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- base/sm/lg son constantes en cada sitio de uso
  }, []);

  return columns;
}
