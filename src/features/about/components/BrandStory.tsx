import { Section, Eyebrow } from '@/components/ui';
import { BrandLogo } from '@/components/common';
import { site } from '@/config/site';

export function BrandStory() {
  return (
    <Section id="historia">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div className="flex flex-col gap-5">
          <Eyebrow>Nuestra historia</Eyebrow>
          <h1 className="text-heat text-4xl sm:text-5xl">
            El sabor de la auténtica hamburguesa
          </h1>
          <p className="text-cream-dim">
            Mundo Burguer nació en Moriles con una idea sencilla: hamburguesas
            de verdad, hechas al momento, con producto fresco y sin atajos. De
            ahí nuestro eslogan, que llevamos por bandera desde el primer día.
          </p>
          <p className="text-cream-dim">
            Cada fin de semana encendemos la plancha para servir menús con
            nombres de medio mundo —del Americano al Ibérico, del Turco al
            Neoyorkino— además de pizzas de masa artesana, empanadas caseras y
            raciones para compartir. Todo para comer en nuestro local o llevar a
            casa.
          </p>
          <p className="text-sm text-cream-mute">
            {site.address.full} · {site.hours.summary}
          </p>
        </div>

        <div className="flex justify-center p-10">
          <BrandLogo className="h-auto w-full max-w-[26rem] select-none drop-shadow-[0_12px_40px_rgba(0,0,0,0.55)]" />
        </div>
      </div>
    </Section>
  );
}
