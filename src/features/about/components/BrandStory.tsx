import { Section } from '@/components/ui';
import { SloganLockup } from '@/components/common';
import { site } from '@/config/site';

export function BrandStory() {
  return (
    <Section id="historia">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div className="flex flex-col gap-5">
          <p className="font-script text-2xl text-amber">Nuestra historia</p>
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

        <div className="flex justify-center rounded-3xl border border-hair bg-grain glow-warm p-10">
          <SloganLockup />
        </div>
      </div>
    </Section>
  );
}
