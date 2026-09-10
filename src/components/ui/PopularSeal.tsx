import { Flame } from 'lucide-react';
import { cn } from '@/lib/cn';

/** Sello "Popular": círculo naranja con una llama. Gemelo de `NewSeal`. */
export function PopularSeal({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-grid aspect-square w-14 place-items-center rounded-full bg-orange text-cream shadow-lg shadow-black/40 ring-2 ring-cream/70 ring-offset-2 ring-offset-bg',
        className
      )}
      aria-hidden="true"
    >
      <span className="flex flex-col items-center leading-none">
        <Flame size={16} className="fill-cream/90" aria-hidden="true" />
        <span className="mt-0.5 font-script text-[0.7rem]">Popular</span>
      </span>
    </span>
  );
}
