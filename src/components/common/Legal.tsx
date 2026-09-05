import type { ReactNode } from 'react';
import { Section, Container, Eyebrow } from '@/components/ui';

interface LegalPageLayoutProps {
  eyebrow: string;
  title: string;
  updated: string;
  children: ReactNode;
}

/** Estructura común de las páginas legales (Aviso Legal, Privacidad, Cookies). */
export function LegalPageLayout({
  eyebrow,
  title,
  updated,
  children,
}: LegalPageLayoutProps) {
  return (
    <Section id="legal">
      <Container size="narrow">
        <header className="flex flex-col gap-3 border-b border-hair pb-8">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="text-heat text-3xl sm:text-4xl">{title}</h1>
          <p className="text-sm text-cream-mute">
            Última actualización: {updated}
          </p>
        </header>
        <div className="mt-8 flex flex-col gap-8">{children}</div>
      </Container>
    </Section>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="font-sans text-lg font-semibold normal-case tracking-normal text-cream sm:text-xl">
        {title}
      </h2>
      <div className="mt-3 flex flex-col gap-3 text-sm leading-relaxed text-cream-dim sm:text-base [&_a]:text-amber [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-amber-bright [&_li]:ml-5 [&_ol]:list-decimal [&_ul]:list-disc">
        {children}
      </div>
    </section>
  );
}
