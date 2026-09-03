import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Card, Eyebrow } from '@/components/ui';
import { contactFaq } from '../data/faq';

/**
 * Preguntas frecuentes sobre la carta y cómo pedir. Sustituye al bloque de
 * horario/dirección/indicaciones (esa información vive ya en la portada y en el
 * pie de página) para no repetirla en la vista de Contacto.
 *
 * Acordeón accesible de Radix UI; el despliegue se anima con `.anim-accordion`
 * (ver src/styles/index.css).
 */
export function ContactFaq({ className }: { className?: string }) {
  return (
    <Card
      as="section"
      aria-labelledby="faq-titulo"
      className={cn('p-6 sm:p-8', className)}
    >
      <Eyebrow>Antes de pedir</Eyebrow>
      <h2 id="faq-titulo" className="text-heat mt-1 text-2xl sm:text-3xl">
        Preguntas frecuentes
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-cream-dim">
        Lo que más nos preguntáis sobre la carta y las combinaciones que cambian
        el precio del menú. Si te queda alguna duda, llámanos y te la
        resolvemos.
      </p>

      <Accordion.Root
        type="single"
        collapsible
        className="mt-6 divide-y divide-hair"
      >
        {contactFaq.map((item, i) => (
          <Accordion.Item key={item.q} value={`q-${i}`}>
            <Accordion.Header className="flex">
              <Accordion.Trigger
                className={cn(
                  'group flex flex-1 items-center justify-between gap-4 py-4 text-left',
                  // La pregunta hereda Anton (MAYÚSCULAS) del <h3> de Radix, que
                  // en móvil se ve bien. En pantallas grandes, Anton condensado a
                  // tamaño de cuerpo y con interlínea 1.18 queda apretado y las
                  // tildes (MENÚ, SEGÚN, CÓMO) se ven pegadas: solo a partir de
                  // `sm` le damos algo más de cuerpo, interlínea y tracking.
                  'sm:text-lg sm:leading-snug sm:tracking-wide'
                )}
              >
                {item.q}
                <ChevronDown
                  size={18}
                  aria-hidden="true"
                  className="shrink-0 text-amber transition-transform duration-300 ease-out group-data-[state=open]:rotate-180"
                />
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content className="anim-accordion overflow-hidden text-sm text-cream-dim">
              <p className="pb-4 pr-8">{item.a}</p>
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </Card>
  );
}
