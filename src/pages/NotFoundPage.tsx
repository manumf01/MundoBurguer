import { Link } from 'react-router-dom';
import { Seo } from '@/lib/seo';
import { Button } from '@/components/ui';
import logoImg from '@/assets/brand/logo.png';

export function NotFoundPage() {
  return (
    <>
      <Seo title="Página no encontrada" path="/404" />
      <div className="container-mb flex min-h-[60vh] flex-col items-center justify-center gap-5 py-24 text-center">
        <img
          src={logoImg}
          alt=""
          aria-hidden="true"
          width={890}
          height={816}
          className="h-40 w-auto select-none"
        />
        <h1 className="text-heat text-4xl">Esta página se ha perdido</h1>
        <p className="max-w-md text-cream-dim">
          Vuelve al inicio o echa un vistazo a la carta.
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
