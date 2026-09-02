import { Clock, MapPin, Phone, Bike } from 'lucide-react';
import { Section, SectionHeading, Card } from '@/components/ui';
import { MapEmbed, Reveal } from '@/components/common';
import { site } from '@/config/site';
import { telHref } from '@/lib/format';

export function InfoStrip() {
  return (
    <Section id="info" spacing="sm">
      <Reveal>
        <SectionHeading
          eyebrow="Cuándo y dónde"
          title="Pásate a vernos"
          description="Estamos en el centro de Moriles. Ven a cenar o pide a domicilio."
        />
      </Reveal>

      <Reveal className="mt-12 grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <Card className="flex overflow-hidden">
          <MapEmbed className="h-full min-h-72 rounded-none border-0" />
        </Card>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card interactive className="flex flex-col gap-2 p-5">
            <Clock className="text-amber" aria-hidden="true" />
            <h3 className="font-display text-lg text-cream">Horario</h3>
            <p className="text-sm text-cream-dim">{site.hours.summary}</p>
          </Card>
          <Card interactive className="flex flex-col gap-2 p-5">
            <MapPin className="text-amber" aria-hidden="true" />
            <h3 className="font-display text-lg text-cream">Dirección</h3>
            <p className="text-sm text-cream-dim">{site.address.full}</p>
          </Card>
          <Card
            as="a"
            href={telHref(site.phone.e164)}
            interactive
            className="flex flex-col gap-2 p-5"
          >
            <Phone className="text-amber" aria-hidden="true" />
            <h3 className="font-display text-lg text-cream">Teléfono</h3>
            <p className="text-sm text-cream-dim">
              {site.phone.display} · pedidos y reservas
            </p>
          </Card>
          <Card interactive className="flex flex-col gap-2 p-5">
            <Bike className="text-amber" aria-hidden="true" />
            <h3 className="font-display text-lg text-cream">A domicilio</h3>
            <p className="text-sm text-cream-dim">
              {site.delivery.label}. Llámanos y te lo llevamos a casa.
            </p>
          </Card>
        </div>
      </Reveal>
    </Section>
  );
}
