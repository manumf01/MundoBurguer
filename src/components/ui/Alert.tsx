import type { ReactNode } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { cn } from '@/lib/cn';

type AlertTone = 'error' | 'warning' | 'success' | 'info';

const TONE = {
  error: {
    Icon: AlertCircle,
    box: 'border-brand-light/60 bg-brand/15',
    icon: 'text-brand-light',
  },
  warning: {
    Icon: AlertTriangle,
    box: 'border-amber/60 bg-amber/10',
    icon: 'text-amber',
  },
  success: {
    Icon: CheckCircle,
    box: 'border-lime/60 bg-lime/10',
    icon: 'text-lime',
  },
  info: {
    Icon: Info,
    box: 'border-hair-strong bg-white/5',
    icon: 'text-cream-mute',
  },
} as const;

/**
 * Aviso destacado (no un simple texto en rojo): borde de color a la izquierda,
 * icono y fondo tintado según la importancia.
 */
export function Alert({
  tone = 'error',
  title,
  children,
  className,
}: {
  tone?: AlertTone;
  title?: string;
  children?: ReactNode;
  className?: string;
}) {
  const { Icon, box, icon } = TONE[tone];
  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-3 rounded-xl border border-l-4 px-4 py-3 text-sm',
        box,
        className
      )}
    >
      <Icon
        size={18}
        strokeWidth={2.25}
        className={cn('mt-0.5 shrink-0', icon)}
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        {title ? <p className="font-semibold text-cream">{title}</p> : null}
        <div className={cn('text-cream-dim', title && 'mt-0.5')}>
          {children}
        </div>
      </div>
    </div>
  );
}
