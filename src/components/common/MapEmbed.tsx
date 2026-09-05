import { MapPin } from 'lucide-react';
import { cn } from '@/lib/cn';
import { site } from '@/config/site';
import { useCookieConsent } from '@/lib/cookieConsent';
import { Button } from '@/components/ui';

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
  const { consent, savePreferences } = useCookieConsent();
  const query = encodeURIComponent(site.address.mapsQuery);

  if (!consent?.maps) {
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
    return (
      <div
        className={cn(
          'flex w-full flex-col items-center justify-center gap-3 p-6 text-center',
          className
        )}
        style={{ height: height ? `${height}px` : undefined, minHeight: height ? undefined : 220 }}
      >
        <MapPin className="text-amber" size={26} aria-hidden="true" />
        <p className="max-w-xs text-sm text-cream-dim">
          Para mostrar el mapa cargamos un servicio de Google que instala
          cookies de terceros. Puedes aceptarlas o abrir la ubicación
          directamente en Google Maps.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() =>
              savePreferences({ analytics: consent?.analytics ?? false, maps: true })
            }
          >
            Aceptar y ver el mapa
          </Button>
          <Button asChild size="sm" variant="ghost">
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
              Abrir en Google Maps
            </a>
          </Button>
        </div>
      </div>
    );
  }

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
