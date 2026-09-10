import { ProductCard } from '@/features/menu/components';
import { toPreviewProduct, type ProductFormValues } from '@/features/admin';

export function LivePreview({
  values,
  imageUrl,
}: {
  values: ProductFormValues;
  imageUrl: string | null;
}) {
  const product = toPreviewProduct(values, imageUrl);

  return (
    <div>
      <p className="mb-3 text-xs uppercase tracking-widest text-cream-mute">
        Vista previa
      </p>
      <ProductCard
        product={product}
        slots={{ showDescription: true, showAllergens: true }}
      />
      {!values.visible ? (
        <p className="mt-2 text-xs text-cream-mute">
          Marcada como oculta: no se verá en la carta pública.
        </p>
      ) : null}
    </div>
  );
}
