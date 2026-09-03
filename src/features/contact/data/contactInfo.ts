import { site } from '@/config/site';
import { telHref } from '@/lib/format';

/** Datos de contacto derivados de la configuración del sitio. */
export const contactInfo = {
  phone: {
    display: site.phone.display,
    href: telHref(site.phone.e164),
    whatsapp: site.phone.whatsapp,
  },
};
