import { describe, it, expect } from 'vitest';
import { formatPrice, formatDelta, telHref } from './format';

/** Intl usa espacios especiales (NBSP / NNBSP) antes del símbolo de moneda. */
const norm = (value: string) => value.replace(/\s+/g, ' ');

describe('formatPrice', () => {
  it('formatea un número como euros', () => {
    expect(norm(formatPrice(9.9))).toBe('9,90 €');
    expect(norm(formatPrice(12))).toBe('12,00 €');
    expect(norm(formatPrice(0))).toBe('0,00 €');
  });
});

describe('formatDelta', () => {
  it('añade el signo + a los incrementos', () => {
    expect(norm(formatDelta(0.5))).toBe('+0,50 €');
    expect(norm(formatDelta(2))).toBe('+2,00 €');
  });

  it('no añade signo cuando es cero', () => {
    expect(norm(formatDelta(0))).toBe('0,00 €');
  });
});

describe('telHref', () => {
  it('genera un enlace tel: sin espacios', () => {
    expect(telHref('635 306 777')).toBe('tel:635306777');
    expect(telHref('+34 635 306 777')).toBe('tel:+34635306777');
  });
});
