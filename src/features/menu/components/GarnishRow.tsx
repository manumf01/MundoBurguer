import type { ReactElement, SVGProps } from 'react';
import { cn } from '@/lib/cn';
import { IconPopover } from '@/components/common/IconPopover';
import type { GarnishId } from '../types';

const base: SVGProps<SVGSVGElement> = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

function TomatoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M12 8.5c-4 0-6.2 2.8-6.2 6.1A6.2 6.2 0 0 0 12 20.8a6.2 6.2 0 0 0 6.2-6.2c0-3.3-2.2-6.1-6.2-6.1Z" />
      <path d="M12 8.5c0-2 .9-3.2 2.6-3.7" />
      <path d="m9.3 6.4 2.7 2.1 2.7-2.1" />
    </svg>
  );
}

function OnionIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3.2c-1.1 1.9-1.9 2.9-1.9 2.9" />
      <path d="M12 3.2c1.1 1.9 1.9 2.9 1.9 2.9" />
      <path d="M12 21c-4.3 0-6.9-3.3-6.9-7.4C5.1 9 8 6.1 12 6.1s6.9 2.9 6.9 7.5C18.9 17.7 16.3 21 12 21Z" />
      <path d="M9.2 8c-1 2.2-1 8 0 10.9" />
      <path d="M14.8 8c1 2.2 1 8 0 10.9" />
    </svg>
  );
}

function LettuceIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M4.3 13.2C3.4 11.7 4.4 9.8 6.2 9.7c-.2-2 1.7-3.6 3.7-3 .4-2 2.8-2.7 4.4-1.2 1.9-1 4 .1 4 2.2 1.9.3 2.8 2 2.3 3.6C22.6 12 21.7 14 19.7 14H6.3c-1.5 0-2.6-1.5-2-2.8Z" />
      <path d="M8 12.6c2.6 1.1 5.4 1.1 8 0" />
    </svg>
  );
}

const GARNISH_META: Record<
  GarnishId,
  {
    label: string;
    color: string;
    Icon: (p: SVGProps<SVGSVGElement>) => ReactElement;
  }
> = {
  tomate: { label: 'Tomate', color: '#e5533d', Icon: TomatoIcon },
  cebolla: { label: 'Cebolla', color: '#c58fd6', Icon: OnionIcon },
  lechuga: { label: 'Lechuga', color: '#9ccc4f', Icon: LettuceIcon },
};

interface GarnishRowProps {
  garnish: GarnishId[];
  className?: string;
}

/** Fila de guarnición fresca, con el mismo estilo de badge que los alérgenos. */
export function GarnishRow({ garnish, className }: GarnishRowProps) {
  if (garnish.length === 0) return null;
  return (
    <ul
      className={cn('flex flex-wrap items-center gap-1', className)}
      aria-label={`Se sirve con ${garnish
        .map((g) => GARNISH_META[g].label.toLowerCase())
        .join(', ')}`}
    >
      {garnish.map((g) => {
        const { label, color, Icon } = GARNISH_META[g];
        return (
          <li key={g}>
            <IconPopover label={label}>
              <span className="inline-flex items-center rounded-full border border-hair bg-black/25 p-1">
                <Icon width={14} height={14} style={{ color }} />
                <span className="sr-only">{label}</span>
              </span>
            </IconPopover>
          </li>
        );
      })}
    </ul>
  );
}
