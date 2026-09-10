import { describe, it, expect } from 'vitest';
import type { Profile } from '@/features/auth';
import {
  formatLastSeen,
  formatRequestDate,
  sortProfilesForAdmin,
} from './access';

const p = (over: Partial<Profile>): Profile => ({
  id: 'x',
  email: 'x@example.com',
  fullName: null,
  avatarUrl: null,
  status: 'pending',
  role: null,
  requestedAt: '2026-01-01T00:00:00.000Z',
  lastSeenAt: null,
  ...over,
});

describe('sortProfilesForAdmin', () => {
  it('ordena por estado (aprobado, pendiente, denegado) y luego por fecha', () => {
    const list = [
      p({ id: 'd', status: 'denied', requestedAt: '2026-01-01T00:00:00Z' }),
      p({ id: 'p2', status: 'pending', requestedAt: '2026-03-01T00:00:00Z' }),
      p({ id: 'a', status: 'approved', role: 'editor' }),
      p({ id: 'p1', status: 'pending', requestedAt: '2026-02-01T00:00:00Z' }),
    ];
    expect(sortProfilesForAdmin(list).map((x) => x.id)).toEqual([
      'a',
      'p1',
      'p2',
      'd',
    ]);
  });

  it('no muta el array recibido', () => {
    const list = [p({ id: 'b', status: 'denied' }), p({ id: 'a' })];
    const copy = [...list];
    sortProfilesForAdmin(list);
    expect(list).toEqual(copy);
  });
});

describe('formatRequestDate', () => {
  it('formatea una fecha ISO en español', () => {
    expect(formatRequestDate('2026-05-03T10:00:00.000Z')).toMatch(/2026/);
  });
  it('devuelve "—" si no es una fecha válida', () => {
    expect(formatRequestDate('nope')).toBe('—');
  });
});

describe('formatLastSeen', () => {
  it('null -> "nunca"', () => {
    expect(formatLastSeen(null)).toBe('nunca');
  });
  it('ISO -> cadena con la hora', () => {
    expect(formatLastSeen('2026-05-03T18:40:00.000Z')).toMatch(/\d{1,2}:\d{2}/);
  });
  it('basura -> "—"', () => {
    expect(formatLastSeen('nope')).toBe('—');
  });
});
