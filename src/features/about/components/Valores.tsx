import { Flame, Leaf, Globe2, Home } from 'lucide-react';
import { Section, SectionHeading, Card } from '@/components/ui';
import { Reveal } from '@/components/common';

const valores = [
  {
    icon: Flame,
    title: 'Hecho al momento',
    text: 'Nada precocinado: encendemos la plancha cuando llega tu pedido.',
  },
  {
    icon: Leaf,
    title: 'Producto fresco',
    text: 'Pan, carne y verdura de calidad, con los alérgenos siempre a la vista.',
  },
  {
    icon: Globe2,
    title: 'Recetas del mundo',
    text: 'Menús inspirados en países y ciudades, con su combinación de sabores.',
  },
  {
    icon: Home,
    title: 'De Moriles, para llevar',
    text: 'Come con nosotros o pide a domicilio con una llamada.',
  },
];

export function Valores() {
  return (
    <Section id="valores" spacing="sm">
      <SectionHeading
        eyebrow="Por qué Mundo Burguer"
        title="Lo que no cambia"
      />
      <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {valores.map(({ icon: Icon, title, text }, i) => (
          <li key={title} className="h-full">
            <Reveal delay={i * 70} className="h-full">
              <Card interactive className="flex h-full flex-col gap-3 p-6">
                <Icon className="text-amber" aria-hidden="true" />
                <h3 className="font-display text-lg text-cream">{title}</h3>
                <p className="text-sm text-cream-dim">{text}</p>
              </Card>
            </Reveal>
          </li>
        ))}
      </ul>
    </Section>
  );
}
