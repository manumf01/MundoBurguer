import { Seo } from '@/lib/seo';
import { BrandStory, WorldTour, Valores } from '@/features/about/components';

export function AboutPage() {
  return (
    <>
      <Seo
        title="Sobre nosotros"
        description="Mundo Burguer, hamburguesería en Moriles (Córdoba). Hecho al momento, con producto fresco y menús inspirados en medio mundo."
        path="/sobre-nosotros"
      />
      <BrandStory />
      <Valores />
      <WorldTour />
    </>
  );
}
