import { Link } from 'react-router-dom';
import { Seo } from '@/lib/seo';
import { Button } from '@/components/ui';

export function NotFoundPage() {
  return (
    <>
      <Seo title="Página no encontrada" path="/404" />
      <div className="container-mb flex min-h-[60vh] flex-col items-center justify-center gap-5 py-24 text-center">
        <span className="text-7xl" aria-hidden="true">
          🍔
        </span>
        <h1 className="text-heat text-4xl">Esta página se ha perdido</h1>
        <p className="max-w-md text-cream-dim">
          Como una hamburguesa sin queso: no debería pasar. Vuelve al inicio o
          echa un vistazo a la carta.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild variant="primary">
            <Link to="/">Volver al inicio</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/carta">Ver la carta</Link>
          </Button>
        </div>
      </div>
    </>
  );
}
