import { describe, it, expect } from 'vitest';
import { friendlyError } from './adminMenuApi';

describe('friendlyError', () => {
  it('siempre devuelve un Error con mensaje', () => {
    for (const input of [
      null,
      undefined,
      {},
      new Error('x'),
      { code: 'zzz' },
    ]) {
      const out = friendlyError(input);
      expect(out).toBeInstanceOf(Error);
      expect(out.message.length).toBeGreaterThan(0);
    }
  });

  it('P0001: deja pasar el mensaje de la excepción de Postgres', () => {
    expect(
      friendlyError({
        code: 'P0001',
        message: 'No se puede eliminar una categoria con productos activos',
      }).message
    ).toBe('No se puede eliminar una categoria con productos activos');
  });

  it('23505 (unique) -> identificador en uso', () => {
    expect(friendlyError({ code: '23505' }).message).toMatch(/en uso/i);
  });

  it('42501 / RLS -> sin permiso', () => {
    expect(friendlyError({ code: '42501' }).message).toMatch(/permiso/i);
    expect(
      friendlyError({ message: 'new row violates row-level security policy' })
        .message
    ).toMatch(/permiso/i);
  });

  it('PGRST202 -> falta aplicar la migración', () => {
    expect(friendlyError({ code: 'PGRST202' }).message).toMatch(/migraci/i);
  });

  it('PGRST301 / jwt expired -> sesión caducada', () => {
    expect(friendlyError({ message: 'JWT expired' }).message).toMatch(
      /sesión|sesion/i
    );
  });

  it('errores de imagen', () => {
    expect(
      friendlyError({ message: 'mime type image/gif is not supported' }).message
    ).toMatch(/formato de imagen/i);
    expect(
      friendlyError({ message: 'the object exceeded the maximum allowed size' })
        .message
    ).toMatch(/grande/i);
  });

  it('fallo de red', () => {
    expect(friendlyError({ message: 'Failed to fetch' }).message).toMatch(
      /conexión|conexion/i
    );
  });

  it('desconocido con mensaje -> lo añade; sin mensaje -> genérico', () => {
    expect(friendlyError({ message: 'boom' }).message).toContain('boom');
    expect(friendlyError({}).message).toMatch(/Inténtalo de nuevo/i);
  });
});
