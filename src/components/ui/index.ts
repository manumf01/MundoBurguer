export { Button, buttonVariants, type ButtonProps } from './Button';
export { Alert, type AlertTone } from './Alert';
export { Badge, type BadgeProps } from './Badge';
export { NewSeal } from './NewSeal';
export { PopularSeal } from './PopularSeal';
export { Container } from './Container';
export { Section, SectionHeading } from './Section';
export { Eyebrow } from './Eyebrow';
export { Card } from './Card';
export { Toggle } from './Toggle';
export { NumberInput } from './NumberInput';
// `Select` NO se re-exporta aquí a propósito: arrastra `@radix-ui/react-select`
// (pesado) y solo lo usa el panel. Impórtalo con `@/components/ui/Select`.
