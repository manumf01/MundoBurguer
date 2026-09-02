import { Seo, RestaurantJsonLd } from '@/lib/seo';
import { Section } from '@/components/ui';
import { ContactChannels, LocationCard } from '@/features/contact/components';

export function ContactPage() {
  return (
    <>
      <Seo
        title="Contacto"
        description="Cómo contactar y llegar a Mundo Burguer en Moriles (Córdoba): teléfono, horario, dirección y redes sociales."
        path="/contacto"
      />
      <RestaurantJsonLd />

      <Section id="contacto">
        <header className="flex flex-col gap-3">
          <p className="font-script text-2xl text-amber">Hablamos</p>
          <h1 className="text-heat text-4xl sm:text-5xl">Contacto</h1>
          <p className="max-w-2xl text-cream-dim">
            La forma más rápida de pedir o resolver cualquier duda es una
            llamada. Aquí tienes todo lo que necesitas para localizarnos.
          </p>
        </header>

        <div className="mt-12 grid gap-4 lg:grid-cols-2">
          <ContactChannels />
          <LocationCard />
        </div>
      </Section>
    </>
  );
}
