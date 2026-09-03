import { Seo, RestaurantJsonLd } from '@/lib/seo';
import {
  Hero,
  BrandBanner,
  Destacados,
  ConfiguraTeaser,
  InfoStrip,
  SocialCta,
} from '@/features/home/components';

export function HomePage() {
  return (
    <>
      <Seo
        title="Mundo Burguer — El sabor de la auténtica Hamburguesa"
        bare
        path="/"
      />
      <RestaurantJsonLd />
      <Hero />
      <BrandBanner />
      <Destacados />
      <ConfiguraTeaser />
      <InfoStrip />
      <SocialCta />
    </>
  );
}
