import {
  Wheat,
  Egg,
  Fish,
  Milk,
  Nut,
  Bean,
  Shell,
  LeafyGreen,
  Droplets,
  Sprout,
  Wine,
  type LucideIcon,
} from 'lucide-react';
import type { AllergenId } from '../types';

export interface AllergenMeta {
  id: AllergenId;
  label: string;
  icon: LucideIcon;
  /** Color del icono (inspirado en la iconografía de la carta). */
  color: string;
}

export const ALLERGENS: Record<AllergenId, AllergenMeta> = {
  gluten: { id: 'gluten', label: 'Gluten', icon: Wheat, color: '#3fb6c9' },
  crustaceos: {
    id: 'crustaceos',
    label: 'Crustáceos',
    icon: Shell,
    color: '#e58aa0',
  },
  huevos: { id: 'huevos', label: 'Huevos', icon: Egg, color: '#f5a6c8' },
  pescado: { id: 'pescado', label: 'Pescado', icon: Fish, color: '#e8843c' },
  cacahuetes: {
    id: 'cacahuetes',
    label: 'Cacahuetes',
    icon: Nut,
    color: '#c98a4b',
  },
  soja: { id: 'soja', label: 'Soja', icon: Bean, color: '#4a90d9' },
  lacteos: { id: 'lacteos', label: 'Lácteos', icon: Milk, color: '#f0a04b' },
  frutos_cascara: {
    id: 'frutos_cascara',
    label: 'Frutos de cáscara',
    icon: Nut,
    color: '#b98a5e',
  },
  apio: { id: 'apio', label: 'Apio', icon: LeafyGreen, color: '#7cc46b' },
  mostaza: {
    id: 'mostaza',
    label: 'Mostaza',
    icon: Droplets,
    color: '#5bbfa5',
  },
  sesamo: { id: 'sesamo', label: 'Sésamo', icon: Sprout, color: '#b98a5e' },
  sulfitos: {
    id: 'sulfitos',
    label: 'Sulfitos',
    icon: Wine,
    color: '#7cc46b',
  },
  altramuces: {
    id: 'altramuces',
    label: 'Altramuces',
    icon: Bean,
    color: '#c9b24b',
  },
  moluscos: {
    id: 'moluscos',
    label: 'Moluscos',
    icon: Shell,
    color: '#e58aa0',
  },
};

/** Orden canónico para leyendas. */
export const ALLERGEN_ORDER: AllergenId[] = [
  'gluten',
  'crustaceos',
  'huevos',
  'pescado',
  'cacahuetes',
  'soja',
  'lacteos',
  'frutos_cascara',
  'apio',
  'mostaza',
  'sesamo',
  'sulfitos',
  'altramuces',
  'moluscos',
];

/** Alérgenos que realmente aparecen en la carta (para filtros "sin ..."). */
export const ALLERGENS_IN_MENU: AllergenId[] = [
  'gluten',
  'huevos',
  'soja',
  'lacteos',
  'frutos_cascara',
  'sesamo',
  'sulfitos',
  'mostaza',
  'apio',
  'pescado',
  'crustaceos',
];

export const GARNISHES: Record<string, { label: string; color: string }> = {
  tomate: { label: 'Tomate', color: '#e5533d' },
  cebolla: { label: 'Cebolla', color: '#c58fd6' },
  lechuga: { label: 'Lechuga', color: '#9ccc4f' },
};
