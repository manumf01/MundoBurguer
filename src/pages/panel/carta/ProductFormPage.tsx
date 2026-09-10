import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import {
  capitalizeFirst,
  createProduct,
  emptyForm,
  removeProductImageObject,
  setProductConfigGroups,
  setProductFeatured,
  setProductImagePath,
  slugify,
  titleCase,
  toFormValues,
  updateProduct,
  uploadProductImage,
  useAdminMenu,
  validateProduct,
  type FieldErrors,
  type ProductFormValues,
} from '@/features/admin';
import { ProductForm } from './ProductForm';
import { LivePreview } from './LivePreview';
import type { ImageAction } from './ImageField';

export function ProductFormPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { status, categories, products, menuConfig, productBySlug, reload } =
    useAdminMenu();

  const existing = slug ? productBySlug(slug) : undefined;

  const initial = useMemo<ProductFormValues>(
    () => (existing ? toFormValues(existing) : emptyForm()),
    [existing]
  );

  const [values, setValues] = useState<ProductFormValues>(initial);
  const [imageAction, setImageAction] = useState<ImageAction>({ kind: 'keep' });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [seededFor, setSeededFor] = useState(existing?.id ?? null);
  // Si al crear una comida se guarda la fila pero falla algún "extra" (foto,
  // destacado, bloques), se recuerda su id para que reintentar el guardado
  // ACTUALICE esa fila en vez de crear un duplicado.
  const [createdId, setCreatedId] = useState<string | null>(null);

  // Resincroniza el formulario cuando termina de cargar la comida a editar.
  if (existing && existing.id !== seededFor) {
    setSeededFor(existing.id);
    setValues(toFormValues(existing));
    setImageAction({ kind: 'keep' });
  }

  const mode: 'create' | 'edit' = slug || createdId ? 'edit' : 'create';

  const featured = useMemo(
    () =>
      products
        .filter((p) => p.isFeatured)
        .sort((a, b) => (a.featuredOrder ?? 0) - (b.featuredOrder ?? 0)),
    [products]
  );

  if (status === 'loading') return <p className="text-cream-dim">Cargando…</p>;

  if (slug && !existing) {
    return (
      <div className="text-sm text-cream-dim">
        <p>No se ha encontrado esa comida.</p>
        <Link
          to="/panel/carta"
          className="text-amber underline underline-offset-2"
        >
          Volver a la lista
        </Link>
      </div>
    );
  }

  const previewImageUrl =
    imageAction.kind === 'set'
      ? imageAction.previewUrl
      : imageAction.kind === 'remove'
        ? null
        : (existing?.image ?? null);

  const handleChange = (patch: Partial<ProductFormValues>) =>
    setValues((v) => ({ ...v, ...patch }));

  const handleNameChange = (name: string) =>
    setValues((v) => ({
      ...v,
      name,
      slug: mode === 'create' ? slugify(name) : v.slug,
    }));

  const handleNameBlur = () =>
    setValues((v) => ({
      ...v,
      name: titleCase(v.name.trim().replace(/\s+/g, ' ')),
    }));

  const handleDescriptionBlur = () =>
    setValues((v) => ({ ...v, description: capitalizeFirst(v.description) }));

  async function applyFeatured(savedId: string) {
    const wasFeatured = existing?.isFeatured ?? false;
    if (values.isPopular) {
      if (wasFeatured) return;
      const target = values.replacesFeaturedId
        ? featured.find((p) => p.id === values.replacesFeaturedId)
        : null;
      const MAX_FEATURED = 4;
      if (target) {
        await setProductFeatured(target.id, false, null);
        await setProductFeatured(
          savedId,
          true,
          target.featuredOrder ?? featured.length
        );
      } else if (featured.length < MAX_FEATURED) {
        await setProductFeatured(savedId, true, featured.length);
      } else {
        // Ya hay 4 (o más por cambios previos): se sueltan las sobrantes para
        // que "Nuestros imprescindibles" nunca pase de 4.
        for (const evicted of featured.slice(MAX_FEATURED - 1)) {
          await setProductFeatured(evicted.id, false, null);
        }
        await setProductFeatured(savedId, true, MAX_FEATURED - 1);
      }
    } else if (wasFeatured) {
      await setProductFeatured(savedId, false, null);
    }
  }

  async function applyImage(savedId: string, savedSlug: string) {
    if (imageAction.kind === 'set') {
      const path = await uploadProductImage(savedSlug, imageAction.blob);
      try {
        await setProductImagePath(savedId, path);
      } catch (err) {
        // El blob ya está en el bucket pero la fila no lo referencia: se borra
        // para no dejar un objeto huérfano en storage.
        await removeProductImageObject(path).catch(() => {});
        throw err;
      }
      if (existing?.imagePath && existing.imagePath !== path) {
        await removeProductImageObject(existing.imagePath).catch(() => {});
      }
      // Aplicada: se libera el object URL y se vuelve a "keep" para que un
      // reintento del guardado (si falla otro extra) no re-suba la foto.
      URL.revokeObjectURL(imageAction.previewUrl);
      setImageAction({ kind: 'keep' });
    } else if (imageAction.kind === 'remove' && existing?.imagePath) {
      await setProductImagePath(savedId, null);
      await removeProductImageObject(existing.imagePath).catch(() => {});
      setImageAction({ kind: 'keep' });
    }
  }

  async function handleSubmit() {
    setServerError(null);
    const result = validateProduct(values);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    setSaving(true);

    // 1) Guardado principal (crear/actualizar la fila). Si falla aquí no se ha
    //    escrito nada: se muestra el error y se sigue en el formulario.
    let savedId: string;
    try {
      if (mode === 'create') {
        savedId = await createProduct(result.value);
        setCreatedId(savedId);
      } else {
        savedId = existing?.id ?? createdId!;
        await updateProduct(savedId, result.value);
      }
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : 'No se pudo guardar.'
      );
      setSaving(false);
      return;
    }

    // 2) "Extras" independientes. La comida YA está guardada: si uno falla no
    //    se pierde nada — se avisa de qué no se aplicó y se deja reintentar
    //    (los pasos son idempotentes al reguardar).
    const failed: string[] = [];
    try {
      await applyImage(savedId, result.value.slug);
    } catch {
      failed.push('la foto');
    }
    try {
      await applyFeatured(savedId);
    } catch {
      failed.push('los ajustes de «Nuestros imprescindibles»');
    }
    try {
      await setProductConfigGroups(savedId, values.configGroupIds);
    } catch {
      failed.push('los bloques de «Configura tu Menú»');
    }

    await reload().catch(() => {});
    setSaving(false);

    if (failed.length > 0) {
      setServerError(
        `La comida se guardó, pero no se pudo actualizar ${failed.join(' ni ')}. ` +
          'Revísalo y vuelve a guardar.'
      );
      return;
    }
    navigate('/panel/carta');
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        to="/panel/carta"
        className="inline-flex items-center gap-1.5 text-sm text-cream-mute transition-colors hover:text-cream-dim"
      >
        <ArrowLeft size={15} aria-hidden="true" /> Carta
      </Link>

      <h2 className="font-display text-2xl tracking-wide text-cream">
        {mode === 'create'
          ? 'Nueva comida'
          : `Editar · ${existing?.name ?? values.name}`}
      </h2>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <ProductForm
          values={values}
          errors={errors}
          categories={categories}
          mode={mode}
          saving={saving}
          serverError={serverError}
          currentImageUrl={existing?.image ?? null}
          imageAction={imageAction}
          featuredProducts={featured.map((p) => ({ id: p.id, name: p.name }))}
          isCurrentlyFeatured={existing?.isFeatured ?? false}
          configGroups={menuConfig.groups.map((g) => ({
            id: g.id,
            heading: g.heading,
            autoCategories: g.autoCategories,
          }))}
          onChange={handleChange}
          onNameChange={handleNameChange}
          onNameBlur={handleNameBlur}
          onDescriptionBlur={handleDescriptionBlur}
          onImageChange={setImageAction}
          onSubmit={() => void handleSubmit()}
          onCancel={() => navigate('/panel/carta')}
        />
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <LivePreview values={values} imageUrl={previewImageUrl} />
        </aside>
      </div>
    </div>
  );
}
