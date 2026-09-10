import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Seo } from '@/lib/seo';
import { Container, Eyebrow, NewSeal, PopularSeal } from '@/components/ui';
import { AllergenIcon, BrandLogo } from '@/components/common';
import { LogoSpinner } from '@/components/common/LogoSpinner';
import { useMenuData } from '@/features/menu/hooks/useMenuData';
import { GarnishRow } from '@/features/menu/components/GarnishRow';
import { ProductConfigurator } from '@/features/menu/components/ProductConfigurator';
import { ProductPrice } from '@/features/menu/components/ProductPrice';

export function ProductDetailPage() {
  const { slug = '' } = useParams();
  const { products, categories, menuConfig, stale } = useMenuData();

  const product = products.find((p) => p.id === slug);

  if (!product) {
    if (stale) return <LogoSpinner />;
    return (
      <>
        <Seo title="Producto no encontrado" noindex path={`/carta/${slug}`} />
        <Container size="narrow" className="py-16 text-center">
          <h1 className="text-heat text-3xl">No encontramos ese producto</h1>
          <p className="mt-3 text-cream-dim">
            Puede que ya no esté en la carta.
          </p>
          <Link
            to="/carta"
            className="mt-6 inline-flex items-center gap-1.5 text-amber underline underline-offset-4"
          >
            <ArrowLeft size={16} aria-hidden="true" /> Volver a la carta
          </Link>
        </Container>
      </>
    );
  }

  const categoryLabel =
    categories.find((c) => c.id === product.category)?.label ?? 'Carta';

  const hasAutoGroup = menuConfig.groups.some((g) =>
    g.autoCategories.includes(product.category)
  );
  const hasConfigurator =
    (product.configGroupKeys?.length ?? 0) > 0 ||
    (product.variants?.length ?? 0) > 0 ||
    (product.tiers?.length ?? 0) > 0 ||
    hasAutoGroup ||
    (menuConfig.comboCategory !== '' &&
      product.category === menuConfig.comboCategory);

  return (
    <>
      <Seo
        title={product.name}
        description={
          product.description ??
          `${product.name} · ${categoryLabel} de Mundo Burguer.`
        }
        path={`/carta/${product.id}`}
      />

      <Container size="narrow" className="py-10 sm:py-14">
        <Link
          to={`/carta#item-${product.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-cream-mute transition-colors hover:text-cream-dim"
        >
          <ArrowLeft size={15} aria-hidden="true" /> Volver a la carta
        </Link>

        <article className="mt-6 flex flex-col gap-8">
          <header className="flex flex-col gap-4">
            {/* El contenedor exterior NO recorta, así los sellos se salen por
                la esquina como en las tarjetas; el interior sí recorta la
                imagen. */}
            <div className="relative">
              {product.isNew ? (
                <NewSeal className="absolute -right-3 -top-3.5 z-10 w-16 rotate-6 scale-[0.8] sm:scale-100" />
              ) : null}
              {product.isPopular ? (
                <PopularSeal
                  className={cn(
                    'absolute -right-3 z-10 w-16 rotate-6 scale-[0.8] sm:scale-100',
                    product.isNew ? 'top-[3.1rem] sm:top-[3.75rem]' : '-top-3.5'
                  )}
                />
              ) : null}
              <div className="aspect-[16/10] overflow-hidden rounded-2xl border border-hair bg-bg">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="glow-warm flex h-full w-full items-center justify-center bg-surface">
                    <BrandLogo decorative className="h-14 w-auto opacity-20" />
                  </div>
                )}
              </div>
            </div>

            <div>
              <Eyebrow>{categoryLabel}</Eyebrow>
              <h1 className="text-heat mt-1 text-3xl sm:text-4xl">
                {product.name}
              </h1>
            </div>

            {product.description ? (
              <p className="text-cream-dim">{product.description}</p>
            ) : null}

            {product.allergens.length > 0 ||
            (product.garnish?.length ?? 0) > 0 ? (
              <div className="flex flex-col gap-3">
                {(product.garnish?.length ?? 0) > 0 ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase tracking-widest text-cream-mute">
                      Se sirve con
                    </span>
                    <GarnishRow garnish={product.garnish ?? []} />
                  </div>
                ) : null}
                {product.allergens.length > 0 ? (
                  <div>
                    <p className="mb-1.5 text-xs uppercase tracking-widest text-cream-mute">
                      Alérgenos
                    </p>
                    <ul className="flex flex-wrap gap-2">
                      {product.allergens.map((a) => (
                        <li key={a}>
                          <AllergenIcon id={a} size="md" showLabel />
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : null}
          </header>

          {hasConfigurator ? (
            <ProductConfigurator product={product} menuConfig={menuConfig} />
          ) : (
            <div className="rounded-2xl border border-hair bg-white/5 p-5">
              <ProductPrice product={product} />
            </div>
          )}
        </article>
      </Container>
    </>
  );
}
