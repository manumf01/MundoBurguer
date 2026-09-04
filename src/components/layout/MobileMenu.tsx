import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { NavLink } from 'react-router-dom';
import { Menu, X, Phone } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { mainNav } from '@/config/navigation';
import { site } from '@/config/site';
import { telHref } from '@/lib/format';
import { cn } from '@/lib/cn';
import { BrandLogo, SocialLinks } from '@/components/common';
import { Button } from '@/components/ui';

export function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          aria-label="Abrir menú"
          className="grid h-11 w-11 place-items-center text-cream md:hidden"
        >
          <Menu size={24} aria-hidden="true" />
        </button>
      </Dialog.Trigger>

      <AnimatePresence>
        {open ? (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm md:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild forceMount aria-describedby={undefined}>
              <motion.div
                className="fixed inset-y-0 right-0 z-50 flex w-[min(20rem,85vw)] flex-col bg-bg-elevated p-6 shadow-2xl md:hidden"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'tween', duration: 0.25 }}
              >
                <div className="flex items-center justify-between">
                  <Dialog.Title className="sr-only">Menú</Dialog.Title>
                  <div className="flex items-center gap-2.5">
                    <BrandLogo className="h-10 shrink-0" decorative />
                    <BrandLogo variant="wordmark" />
                  </div>
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      aria-label="Cerrar menú"
                      className="grid h-10 w-10 place-items-center rounded-full border border-hair-strong text-cream"
                    >
                      <X size={20} aria-hidden="true" />
                    </button>
                  </Dialog.Close>
                </div>

                <nav className="mt-8 flex flex-col gap-1">
                  {mainNav.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      onClick={() => setOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          'rounded-xl px-4 py-3 font-display text-xl uppercase tracking-wide transition-colors',
                          isActive
                            ? 'bg-amber/15 text-white'
                            : 'text-cream hover:bg-white/5'
                        )
                      }
                    >
                      {item.label}
                    </NavLink>
                  ))}
                </nav>

                <div className="mt-auto flex flex-col gap-4 pt-8">
                  <Button asChild variant="primary" size="lg" full>
                    <a href={telHref(site.phone.e164)}>
                      <Phone size={18} aria-hidden="true" />
                      {site.phone.display}
                    </a>
                  </Button>
                  <SocialLinks className="justify-center" />
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        ) : null}
      </AnimatePresence>
    </Dialog.Root>
  );
}
