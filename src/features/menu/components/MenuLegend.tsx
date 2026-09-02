import { cn } from '@/lib/cn';
import { Card } from '@/components/ui';
import { AllergenLegend } from '@/components/common';

export function MenuLegend({ className }: { className?: string }) {
  return (
    <Card
      as="section"
      aria-labelledby="alergenos-titulo"
      className={cn('p-6 sm:p-8', className)}
    >
      <p className="font-script text-2xl text-amber">Come tranquilo</p>
      <h2 id="alergenos-titulo" className="text-heat mt-1 text-2xl sm:text-3xl">
        Alérgenos
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-cream-dim">
        Cada plato indica los alérgenos que contiene con estos iconos. Si tienes
        cualquier duda o una alergia, dínoslo al hacer el pedido y te ayudamos.
      </p>
      <AllergenLegend className="mt-6" />
    </Card>
  );
}
