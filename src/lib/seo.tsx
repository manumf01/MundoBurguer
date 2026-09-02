import { useEffect } from 'react';
import { site } from '@/config/site';

interface SeoProps {
  /** Título de la pestaña. Se le añade el sufijo de marca salvo en Inicio. */
  title: string;
  description?: string;
  /** Ruta absoluta desde la raíz, p. ej. "/carta". */
  path?: string;
  /** Si es true, usa `title` tal cual sin sufijo de marca. */
  bare?: boolean;
}

function setMeta(
  selector: string,
  attr: 'name' | 'property',
  key: string,
  content: string
) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

/**
 * Gestiona título, descripción, canonical y Open Graph por ruta.
 * (React 19 podría hoistear <title>/<meta>, pero lo hacemos imperativo para
 * garantizar que no se dupliquen entre navegaciones del router.)
 */
export function Seo({
  title,
  description,
  path = '/',
  bare = false,
}: SeoProps) {
  const fullTitle = bare ? title : `${title} · ${site.name}`;
  const desc = description ?? site.shortDescription;
  const canonical = `${site.url}${path}`;

  useEffect(() => {
    document.title = fullTitle;
    setMeta('meta[name="description"]', 'name', 'description', desc);
    setMeta('meta[property="og:title"]', 'property', 'og:title', fullTitle);
    setMeta(
      'meta[property="og:description"]',
      'property',
      'og:description',
      desc
    );
    setMeta('meta[property="og:url"]', 'property', 'og:url', canonical);
    setLink('canonical', canonical);
  }, [fullTitle, desc, canonical]);

  return null;
}

/** JSON-LD schema.org/Restaurant para Inicio y Contacto. */
export function RestaurantJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: site.name,
    slogan: site.slogan,
    description: site.shortDescription,
    url: site.url,
    telephone: site.phone.e164,
    priceRange: site.priceRange,
    servesCuisine: [...site.cuisine],
    address: {
      '@type': 'PostalAddress',
      streetAddress: site.address.street,
      addressLocality: site.address.city,
      addressRegion: site.address.province,
      postalCode: site.address.postalCode,
      addressCountry: 'ES',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: site.address.geo.lat,
      longitude: site.address.geo.lng,
    },
    openingHours: [...site.hours.schema],
    sameAs: [site.social.facebook, site.social.instagram],
    acceptsReservations: false,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
