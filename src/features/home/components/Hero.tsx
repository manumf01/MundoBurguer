import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  UtensilsCrossed,
  MapPin,
  CalendarClock,
  Clock,
  Bike,
} from 'lucide-react';
import { site } from '@/config/site';
import { Button } from '@/components/ui';
import { SloganLockup } from '@/components/common';

const chips = [
  { icon: CalendarClock, label: 'Fines de semana y festivos' },
  { icon: Clock, label: 'Desde las 20:00h' },
  { icon: MapPin, label: 'Moriles (Córdoba)' },
  { icon: Bike, label: 'A domicilio' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export function Hero() {
  return (
    <section className="glow-warm bg-grain relative -mt-[var(--spacing-nav)] overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-bg" />

      {/* Halos de color flotantes (decorativos) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="anim-float absolute -left-24 top-[12%] h-64 w-64 rounded-full bg-orange/25 blur-3xl" />
        <div
          className="anim-float absolute -right-28 top-[20%] h-80 w-80 rounded-full bg-brand/35 blur-3xl"
          style={{ animationDelay: '1.1s' }}
        />
        <div
          className="anim-float absolute bottom-[8%] left-[22%] h-52 w-52 rounded-full bg-amber/15 blur-3xl"
          style={{ animationDelay: '2.2s' }}
        />
        <div
          className="anim-float absolute bottom-[16%] right-[16%] h-40 w-40 rounded-full bg-lime/10 blur-3xl"
          style={{ animationDelay: '0.5s' }}
        />
      </div>

      <div className="container-mb relative flex min-h-[92vh] flex-col items-center justify-center gap-8 pb-20 pt-[calc(var(--spacing-nav)+3rem)] text-center">
        <motion.div
          initial="hidden"
          animate="visible"
          transition={{ staggerChildren: 0.12 }}
          className="flex flex-col items-center gap-8"
        >
          <motion.div variants={fadeUp}>
            <h1 className="sr-only">
              {site.name} — {site.slogan}
            </h1>
            <SloganLockup priority className="mx-auto" />
          </motion.div>

          <motion.p
            variants={fadeUp}
            className="max-w-xl text-lg text-cream-dim"
          >
            Menús del mundo, hamburguesas premium, pizzas de masa artesana y
            empanadas caseras en el corazón de Moriles. Ven a disfrutarlas con
            nosotros o pídelas a domicilio.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <Button asChild variant="primary" size="lg">
              <Link to="/carta">
                <UtensilsCrossed size={18} aria-hidden="true" />
                Ver la carta
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/contacto">
                <MapPin size={18} aria-hidden="true" />
                Cómo llegar
              </Link>
            </Button>
          </motion.div>

          <motion.ul
            variants={fadeUp}
            className="flex flex-wrap justify-center gap-2"
          >
            {chips.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="inline-flex items-center gap-2 rounded-full border border-hair bg-white/5 px-3.5 py-1.5 text-sm text-cream-dim"
              >
                <Icon size={14} className="text-amber" aria-hidden="true" />
                {label}
              </li>
            ))}
          </motion.ul>
        </motion.div>
      </div>
    </section>
  );
}
