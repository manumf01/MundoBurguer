import { cn } from '@/lib/cn';
import { site } from '@/config/site';

interface MapEmbedProps {
  className?: string;
  /** Alto del mapa; por defecto 100% del contenedor. */
  height?: number;
  /** Permite interactuar (zoom/pan). Por defecto sí. */
  interactive?: boolean;
}

export function MapEmbed({
  className,
  height,
  interactive = true,
}: MapEmbedProps) {
  const query = encodeURIComponent(site.address.mapsQuery);
  return (
    <iframe
      title={`Mapa de la ubicación de ${site.name}, ${site.address.full}`}
      src={`https://www.google.com/maps?q=${query}&z=16&output=embed`}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      tabIndex={interactive ? undefined : -1}
      className={cn(
        'w-full rounded-2xl border border-hair grayscale-[0.15]',
        !interactive && 'pointer-events-none select-none',
        className
      )}
      style={{ height: height ? `${height}px` : '100%' }}
    />
  );
}
