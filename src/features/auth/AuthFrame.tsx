import type { ReactNode } from 'react';
import { Container, Card } from '@/components/ui';

/**
 * Tarjeta centrada para las pantallas de acceso. Se renderiza dentro de
 * <Layout> (navbar, footer y fondo de la web), así que solo aporta la caja:
 * misma estética que el resto de tarjetas del sitio.
 */
export function AuthFrame({ children }: { children: ReactNode }) {
  return (
    <Container className="flex min-h-[70vh] items-center justify-center py-16">
      <Card className="w-full max-w-md p-8 text-center sm:p-10">{children}</Card>
    </Container>
  );
}
