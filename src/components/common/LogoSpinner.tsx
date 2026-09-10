import { cn } from '@/lib/cn';
import logoImg from '@/assets/brand/logo.png';

/**
 * Pantalla de carga de la parte privada: el logo de Mundo Burguer "latiendo"
 * dentro de un aro que gira, sin tarjeta ni borde alrededor. Sustituye a los
 * textos sueltos "Un momento…" / "Comprobando acceso…".
 */
export function LogoSpinner({ className }: { className?: string }) {
  return (
    <div
      role="status"
      aria-label="Cargando"
      className={cn(
        'flex min-h-[60vh] items-center justify-center py-16',
        className
      )}
    >
      <span className="relative grid h-20 w-20 place-items-center">
        <span
          aria-hidden="true"
          className="anim-logo-ring absolute inset-0 rounded-full border-2 border-hair border-t-amber"
        />
        <img
          src={logoImg}
          alt=""
          aria-hidden="true"
          width={890}
          height={816}
          className="anim-logo-pulse h-11 w-auto select-none"
        />
      </span>
    </div>
  );
}
