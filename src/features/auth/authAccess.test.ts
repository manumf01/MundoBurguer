import { describe, it, expect } from 'vitest';
import { resolveAccess } from './authAccess';
import type { Profile } from './types';

const profile = (over: Partial<Profile>): Profile => ({
  id: 'u1',
  email: 'x@example.com',
  fullName: null,
  avatarUrl: null,
  status: 'pending',
  role: null,
  requestedAt: '2026-01-01T00:00:00Z',
  lastSeenAt: null,
  ...over,
});

const base = { configured: true, loading: false, hasSession: true };

describe('resolveAccess', () => {
  it('sin configurar gana a todo', () => {
    expect(
      resolveAccess({ ...base, configured: false, profile: null })
    ).toEqual({ status: 'unconfigured' });
  });

  it('loading mientras se resuelve la sesión', () => {
    expect(resolveAccess({ ...base, loading: true, profile: null })).toEqual({
      status: 'loading',
    });
  });

  it('sin sesión -> anonymous', () => {
    expect(
      resolveAccess({ ...base, hasSession: false, profile: null })
    ).toEqual({ status: 'anonymous' });
  });

  it('con sesión pero sin perfil todavía -> loading', () => {
    expect(resolveAccess({ ...base, profile: null })).toEqual({
      status: 'loading',
    });
  });

  it('perfil pending -> pending', () => {
    expect(
      resolveAccess({ ...base, profile: profile({ status: 'pending' }) })
    ).toEqual({ status: 'pending' });
  });

  it('perfil denied -> denied (aunque tenga rol)', () => {
    expect(
      resolveAccess({
        ...base,
        profile: profile({ status: 'denied', role: 'editor' }),
      })
    ).toEqual({ status: 'denied' });
  });

  it('approved + admin -> ready admin', () => {
    expect(
      resolveAccess({
        ...base,
        profile: profile({ status: 'approved', role: 'admin' }),
      })
    ).toEqual({ status: 'ready', role: 'admin' });
  });

  it('approved + editor -> ready editor', () => {
    expect(
      resolveAccess({
        ...base,
        profile: profile({ status: 'approved', role: 'editor' }),
      })
    ).toEqual({ status: 'ready', role: 'editor' });
  });

  it('approved SIN rol (incoherente) -> pending, nunca ready', () => {
    expect(
      resolveAccess({
        ...base,
        profile: profile({ status: 'approved', role: null }),
      })
    ).toEqual({ status: 'pending' });
  });
});
