import { site } from '@/config/site';
import { telHref } from '@/lib/format';

/** Datos de contacto derivados de la configuración del sitio. */
export const contactInfo = {
  phone: {
    display: site.phone.display,
    href: telHref(site.phone.e164),
    whatsapp: site.phone.whatsapp,
  },
  address: {
    full: site.address.full,
  },
  hours: {
    summary: site.hours.summary,
    note: site.hours.note,
  },
  howToArrive:
    'Estamos en la C/ Monturque, en pleno centro de Moriles. Hay aparcamiento en las calles cercanas.',
};
