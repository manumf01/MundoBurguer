import { Section, Card } from '@/components/ui';
import { SocialLinks, Reveal } from '@/components/common';

export function SocialCta() {
  return (
    <Section spacing="sm">
      <Reveal>
        <Card className="flex flex-col items-center gap-5 p-8 text-center sm:p-12">
          <p className="font-script text-2xl text-amber">Síguenos</p>
          <h2 className="text-heat text-2xl sm:text-3xl">
            Novedades, promos y mucha hamburguesa
          </h2>
          <p className="max-w-xl text-cream-dim">
            Te contamos las nuevas incorporaciones a la carta y los días que
            abrimos en nuestros perfiles de Facebook e Instagram.
          </p>
          <SocialLinks />
        </Card>
      </Reveal>
    </Section>
  );
}
