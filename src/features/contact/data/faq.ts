/**
 * Preguntas frecuentes de la página de Contacto.
 * Se centran en dudas sobre la carta —sobre todo combinaciones que cambian el
 * precio del menú— y en cómo pedir. Los importes de personalización salen de
 * la carta oficial; fuente de verdad: src/features/menu/data/menuConfig.ts.
 */
export interface FaqItem {
  q: string;
  a: string;
}

export const contactFaq: FaqItem[] = [
  {
    q: '¿El precio del menú cambia según la carne que elija?',
    a: 'Sí. Cada menú se sirve con carne de cerdo incluida en el precio de la carta. Cambiarla a ternera o a pollo empanado son 0,50 € más; a buey, 2,00 € más.',
  },
  {
    q: '¿Puedo cambiar las patatas por otra cosa?',
    a: 'Puedes sustituir las patatas fritas por cualquier complemento de la carta (tequeños, nuggets, aros de cebolla…) por 2,00 € más.',
  },
  {
    q: '¿Cómo hago el menú más grande?',
    a: 'Pídelo como Menú XL: 2,00 € más por bastante más cantidad. También puedes sumar un ingrediente extra o un extra de salsa por 0,50 € cada uno.',
  },
  {
    q: '¿Las pizzas y los complementos tienen un precio único?',
    a: 'No. Las pizzas van en tamaño Individual o Familiar, cada uno con su precio. Los complementos se piden por piezas (6, 9, 12, 25…) y el importe depende de la cantidad.',
  },
  {
    q: 'Tengo una alergia alimentaria, ¿cómo lo consulto?',
    a: 'Cada plato de la carta muestra sus alérgenos con iconos. Aun así, dínoslo al hacer el pedido y lo revisamos contigo antes de prepararlo.',
  },
  {
    q: '¿Hay opción para los más pequeños?',
    a: 'Sí, el Menú Infantil: hamburguesa con queso y patatas, o nuggets con patatas.',
  },
  {
    q: '¿Puedo pedir para llevar, a domicilio o reservar para un grupo?',
    a: 'Sí a todo. Para llevar y a domicilio, llámanos o escríbenos por WhatsApp. Para grupos, avísanos con antelación y te guardamos sitio.',
  },
];
