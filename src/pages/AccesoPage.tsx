import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { Lock, LogOut } from 'lucide-react';
import { Seo } from '@/lib/seo';
import { Button, Eyebrow } from '@/components/ui';
import { LogoSpinner } from '@/components/common/LogoSpinner';
import { AuthFrame, useAuth } from '@/features/auth';

function Title({ children }: { children: ReactNode }) {
  return <h1 className="text-heat mt-1 text-3xl sm:text-4xl">{children}</h1>;
}

function SignOutButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-6 inline-flex items-center gap-1.5 rounded-lg border border-hair bg-white/5 px-3 py-1.5 text-xs font-semibold text-cream-dim transition-colors hover:border-amber/50 hover:bg-amber/10 hover:text-cream"
    >
      <LogOut size={14} aria-hidden="true" />
      Cerrar sesión
    </button>
  );
}

/**
 * Punto de entrada a la parte privada. Misma estética que el resto de la web
 * (navbar, footer y fondo los pone <Layout>); aquí solo va la tarjeta con el
 * botón de Google y el mensaje que corresponda al estado.
 */
export function AccesoPage() {
  const { access, signInWithGoogle, signOut } = useAuth();

  if (access.status === 'ready') return <Navigate to="/panel" replace />;

  // La carga se muestra a pantalla completa, sin la tarjeta de <AuthFrame>.
  if (access.status === 'loading') {
    return (
      <>
        <Seo title="Acceso" noindex bare />
        <LogoSpinner />
      </>
    );
  }

  let body: ReactNode = null;
  switch (access.status) {
    case 'unconfigured':
      body = (
        <p className="text-cream-dim">
          El acceso no está disponible ahora mismo.
        </p>
      );
      break;

    case 'pending':
      body = (
        <>
          <Eyebrow className="text-center">Área privada</Eyebrow>
          <Title>Solicitud registrada</Title>
          <p className="mt-4 text-cream-dim">
            El administrador de la web decidirá si tu solicitud de acceso es
            válida. Vuelve a intentarlo más tarde.
          </p>
          <SignOutButton onClick={() => void signOut()} />
        </>
      );
      break;

    case 'denied':
      body = (
        <>
          <Eyebrow className="text-center">Área privada</Eyebrow>
          <Title>Acceso no aprobado</Title>
          <p className="mt-4 text-cream-dim">
            Tu solicitud de acceso no ha sido aprobada. Si crees que es un
            error, contacta con el administrador.
          </p>
          <SignOutButton onClick={() => void signOut()} />
        </>
      );
      break;

    case 'anonymous':
      body = (
        <>
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-hair bg-white/5 text-amber">
            <Lock size={20} aria-hidden="true" />
          </span>
          <Eyebrow className="text-center">Área privada</Eyebrow>
          <Title>Administración</Title>
          <p className="mb-6 mt-4 text-sm text-cream-dim">
            Vas a acceder a la administración del sitio. Si el correo con el que
            entras no tiene permiso del administrador, se registrará una
            solicitud de acceso. Si ya lo tiene, entrarás directamente.
          </p>
          <Button type="button" full onClick={() => void signInWithGoogle()}>
            Continuar con Google
          </Button>
        </>
      );
      break;
  }

  return (
    <>
      <Seo title="Acceso" noindex bare />
      <AuthFrame>{body}</AuthFrame>
    </>
  );
}
