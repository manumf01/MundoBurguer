import { motion } from 'framer-motion';

/**
 * Franja ancha entre el Hero y los destacados. Reaprovecha el diseño de la
 * antigua "SloganBanner" pero SIN repetir el eslogan (ya sale en grande en el
 * Hero): aquí contamos cómo cocinamos.
 *
 * ▶ Para cambiar el texto, edita estas dos líneas: */
const HEADLINE = 'Lo bueno empieza con buenos ingredientes.';
const SUBLINE = 'Pan del día · Carne fresca · Salsas de la casa';

export function BrandBanner() {
  return (
    <section
      aria-label="Cómo cocinamos en Mundo Burguer"
      className="border-y border-hair bg-linear-to-r from-brand-dark via-brand to-brand-dark py-14"
    >
      <div className="container-mb text-center">
        <motion.p
          initial={{ opacity: 0, scale: 0.94 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="font-script text-4xl text-cream drop-shadow-[0_4px_16px_rgba(0,0,0,0.4)] sm:text-5xl"
        >
          {HEADLINE}
        </motion.p>
        <p className="mt-4 font-display  uppercase tracking-[0.18em] text-amber sm:text-2xl">
          {SUBLINE}
        </p>
      </div>
    </section>
  );
}
