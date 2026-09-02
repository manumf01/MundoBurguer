import { MapPin, Clock, Info } from 'lucide-react';
import { Card } from '@/components/ui';
import { MapEmbed } from '@/components/common';
import { contactInfo } from '../data/contactInfo';
import { DirectionsButton } from './DirectionsButton';

export function LocationCard() {
  return (
    <Card className="flex flex-col overflow-hidden">
      <MapEmbed height={280} className="rounded-none border-0" />
      <div className="flex flex-col gap-4 p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <MapPin
            size={18}
            className="mt-0.5 shrink-0 text-amber"
            aria-hidden="true"
          />
          <div>
            <h2 className="font-display text-lg text-cream">Dónde estamos</h2>
            <p className="text-sm text-cream-dim">{contactInfo.address.full}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Clock
            size={18}
            className="mt-0.5 shrink-0 text-amber"
            aria-hidden="true"
          />
          <div>
            <h2 className="font-display text-lg text-cream">Horario</h2>
            <p className="text-sm text-cream-dim">
              {contactInfo.hours.summary}
            </p>
            <p className="mt-1 text-xs text-cream-mute">
              {contactInfo.hours.note}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Info
            size={18}
            className="mt-0.5 shrink-0 text-amber"
            aria-hidden="true"
          />
          <div>
            <h2 className="font-display text-lg text-cream">Indicaciones</h2>
            <p className="text-sm text-cream-dim">{contactInfo.howToArrive}</p>
          </div>
        </div>

        <div>
          <DirectionsButton />
          <p className="mt-2 text-xs text-cream-mute">
            Si compartes tu ubicación te calculamos la ruta; si no, te llevamos
            solo a nuestra posición en el mapa.
          </p>
        </div>
      </div>
    </Card>
  );
}
