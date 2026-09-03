import { Phone, MessageCircle } from 'lucide-react';
import { Card, Button, Eyebrow } from '@/components/ui';
import { SocialLinks } from '@/components/common';
import { site } from '@/config/site';
import { contactInfo } from '../data/contactInfo';

export function ContactChannels() {
  return (
    <Card className="flex flex-col gap-6 p-6 sm:p-8">
      <div>
        <Eyebrow>Llámanos</Eyebrow>
        <a
          href={contactInfo.phone.href}
          className="mt-1 block font-display text-4xl text-cream transition-colors hover:text-amber sm:text-5xl"
        >
          {contactInfo.phone.display}
        </a>
        <p className="mt-2 text-sm text-cream-dim">
          Para pedidos {site.delivery.available ? 'a domicilio' : ''}, reservas
          y cualquier consulta. Te atendemos en horario de apertura.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild variant="primary" size="lg">
          <a href={contactInfo.phone.href}>
            <Phone size={18} aria-hidden="true" />
            Llamar ahora
          </a>
        </Button>
        <Button asChild variant="outline" size="lg">
          <a
            href={contactInfo.phone.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle size={18} aria-hidden="true" />
            WhatsApp
          </a>
        </Button>
      </div>

      <div className="border-t border-hair pt-5">
        <p className="mb-3 text-sm text-cream-mute">
          También estamos en redes sociales
        </p>
        <SocialLinks variant="inline" />
      </div>
    </Card>
  );
}
