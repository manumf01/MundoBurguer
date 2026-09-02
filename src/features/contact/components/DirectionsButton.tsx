import { useState } from 'react';
import { Navigation } from 'lucide-react';
import { Button } from '@/components/ui';
import { site } from '@/config/site';

const destination = encodeURIComponent(site.address.mapsQuery);
const locationUrl = `https://www.google.com/maps/search/?api=1&query=${destination}`;
const routeUrl = (lat: number, lng: number) =>
  `https://www.google.com/maps/dir/?api=1&origin=${lat},${lng}&destination=${destination}&travelmode=driving`;

function openMaps(url: string) {
  // Enlace temporal + click: abre SIEMPRE en pestaña nueva y nunca navega la
  // actual (window.open con 'noopener' devuelve null y disparaba un fallback
  // que cargaba Maps en esta pestaña, perdiendo la navegación de la web).
  const a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/**
 * Al pulsar:
 *  1. El navegador muestra su diálogo de permiso de ubicación EN esta página.
 *  2. Según la respuesta:
 *     - Permite  → abre Google Maps con la ruta desde su posición al restaurante.
 *     - Deniega  → abre solo la ubicación del restaurante, sin ruta.
 */
export function DirectionsButton({ className }: { className?: string }) {
  const [locating, setLocating] = useState(false);

  const handleClick = () => {
    if (!('geolocation' in navigator)) {
      openMaps(locationUrl);
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        openMaps(routeUrl(pos.coords.latitude, pos.coords.longitude));
      },
      () => {
        setLocating(false);
        openMaps(locationUrl);
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
    );
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleClick}
      disabled={locating}
      aria-live="polite"
      className={className}
    >
      <Navigation
        size={16}
        className={locating ? 'animate-pulse' : undefined}
        aria-hidden="true"
      />
      {locating ? 'Buscando tu ubicación…' : 'Cómo llegar'}
    </Button>
  );
}
