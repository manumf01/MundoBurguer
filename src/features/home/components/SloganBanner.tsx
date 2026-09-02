import { motion } from 'framer-motion';
import { site } from '@/config/site';

/** Franja ancha que refuerza el eslogan de la marca entre secciones. */
export function SloganBanner() {
  return (
    <section
      aria-label="Eslogan de Mundo Burguer"
      className="border-y border-hair bg-linear-to-r from-brand-dark via-brand to-brand-dark py-14"
    >
      <div className="container-mb text-center">
        <motion.p
          initial={{ opacity: 0, scale: 0.94 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="font-script text-3xl text-cream drop-shadow-[0_4px_16px_rgba(0,0,0,0.4)] sm:text-5xl"
        >
          {site.slogan}
        </motion.p>
        <p className="mt-4 font-display text-lg uppercase tracking-[0.18em] text-amber sm:text-2xl">
          Mundo Burguer · Moriles
        </p>
      </div>
    </section>
  );
}
