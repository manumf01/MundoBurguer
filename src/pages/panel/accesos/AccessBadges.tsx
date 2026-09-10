import { cn } from '@/lib/cn';
import type { Profile } from '@/features/auth';

const STATUS = {
  pending: {
    label: 'Pendiente',
    cls: 'border-amber/50 bg-amber/10 text-amber',
  },
  approved: {
    label: 'Con acceso',
    cls: 'border-lime/50 bg-lime/10 text-lime',
  },
  denied: {
    label: 'Denegado',
    cls: 'border-brand-light/50 bg-brand/10 text-brand-light',
  },
} as const;

export function StatusBadge({ status }: { status: Profile['status'] }) {
  const s = STATUS[status];
  return (
    <span
      className={cn(
        'shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
        s.cls
      )}
    >
      {s.label}
    </span>
  );
}

export function RoleBadge({ role }: { role: Profile['role'] }) {
  if (!role) return null;
  return (
    <span className="shrink-0 rounded-full border border-hair bg-white/5 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-widest text-cream-mute">
      {role}
    </span>
  );
}
