import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProductCard } from './ProductCard';
import type { Product } from '../types';

const base: Product = {
  id: 'test-1',
  name: 'Menú de prueba',
  description: 'Descripción de prueba.',
  category: 'menus',
  price: 6.5,
  allergens: ['gluten', 'lacteos'],
};

describe('ProductCard', () => {
  it('muestra nombre, descripción y precio', () => {
    render(<ProductCard product={base} />);
    expect(
      screen.getByRole('heading', { name: 'Menú de prueba' })
    ).toBeInTheDocument();
    expect(screen.getByText('Descripción de prueba.')).toBeInTheDocument();
    expect(screen.getByText('6,50 €')).toBeInTheDocument();
  });

  it('anuncia los alérgenos de forma accesible', () => {
    render(<ProductCard product={base} />);
    expect(
      screen.getByLabelText('Alérgenos: Gluten, Lácteos')
    ).toBeInTheDocument();
  });

  it('muestra el sello "Nuevo" cuando corresponde', () => {
    render(<ProductCard product={{ ...base, isNew: true }} />);
    expect(screen.getByText(/Nuevo/)).toBeInTheDocument();
  });

  it('renderiza precios por variante', () => {
    render(
      <ProductCard
        product={{
          ...base,
          price: undefined,
          variants: [
            { label: 'Individual', price: 7.5 },
            { label: 'Familiar', price: 11 },
          ],
        }}
      />
    );
    expect(screen.getByText('7,50 €')).toBeInTheDocument();
    expect(screen.getByText('11,00 €')).toBeInTheDocument();
  });
});
