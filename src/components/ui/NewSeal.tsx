import { cn } from '@/lib/cn';

/** Sello "¡Nuevo!" inspirado en el de la carta (círculo rojo con estrellas). */
export function NewSeal({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-grid aspect-square w-14 place-items-center rounded-full bg-seal text-cream shadow-lg shadow-black/40 ring-2 ring-cream/70 ring-offset-2 ring-offset-bg',
        className
      )}
      aria-hidden="true"
    >
      <span className="text-center font-script text-sm leading-none">
        ¡Nuevo!
        <span className="mt-0.5 block text-[0.5rem] tracking-[0.2em]">
          ★ ★ ★
        </span>
      </span>
    </span>
  );
}
