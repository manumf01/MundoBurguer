import { Seo, RestaurantJsonLd } from '@/lib/seo';
import { Section, Card, Eyebrow } from '@/components/ui';
import { MapEmbed } from '@/components/common';
import {
  ContactChannels,
  ContactFaq,
  DirectionsButton,
} from '@/features/contact/components';

export function ContactPage() {
  return (
    <>
      <Seo
        title="Contacto"
        description="Cómo contactar y llegar a Mundo Burguer en Moriles (Córdoba): teléfono, WhatsApp, redes sociales y las dudas más habituales sobre la carta."
        path="/contacto"
      />
      <RestaurantJsonLd />

      <Section id="contacto">
        <header className="flex flex-col gap-3">
          <Eyebrow>Hablamos</Eyebrow>
          <h1 className="text-heat text-4xl sm:text-5xl">Contacto</h1>
          <p className="max-w-2xl text-cream-dim">
            La forma más rápida de pedir o resolver cualquier duda es una
            llamada. Aquí tienes cómo localizarnos y las preguntas que más nos
            hacéis sobre la carta.
          </p>
        </header>

        <div className="mt-12 grid gap-4 lg:grid-cols-2">
          <ContactChannels />

          <Card className="flex flex-col overflow-hidden">
            <MapEmbed height={280} className="rounded-none border-0" />
            <div className="p-6 sm:p-8">
              <DirectionsButton />
              <p className="mt-2 text-xs text-cream-mute">
                Si compartes tu ubicación te calculamos la ruta; si no, te
                llevamos a nuestra posición en el mapa.
              </p>
            </div>
          </Card>
        </div>

        <ContactFaq className="mt-4" />
      </Section>
    </>
  );
}
