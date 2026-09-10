import { useEffect, useRef, useState, type DragEvent } from 'react';
import { ImagePlus, Loader2, RotateCcw, Trash2, Undo2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import {
  ConfirmDialog,
  MAX_INPUT_MB,
  checkImageFile,
  toCroppableUrl,
} from '@/features/admin';
import { CropDialog } from './CropDialog';

export type ImageAction =
  | { kind: 'keep' }
  | { kind: 'set'; blob: Blob; previewUrl: string }
  | { kind: 'remove' };

const ACCEPT =
  'image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif';

export function ImageField({
  currentUrl,
  action,
  onChange,
}: {
  currentUrl: string | null;
  action: ImageAction;
  onChange: (action: ImageAction) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [dragging, setDragging] = useState(false);

  // Al abandonar el formulario sin guardar, revoca cualquier object URL que
  // siga vivo (los flujos normales de recorte/deshacer ya lo hacen en su
  // sitio; revocar dos veces es inofensivo). El ref se mantiene al día en un
  // efecto para que la limpieza de desmontaje vea el último valor.
  const liveUrls = useRef<{ crop: string | null; preview: string | null }>({
    crop: null,
    preview: null,
  });
  useEffect(() => {
    liveUrls.current = {
      crop: cropSrc,
      preview: action.kind === 'set' ? action.previewUrl : null,
    };
  });
  useEffect(
    () => () => {
      if (liveUrls.current.crop) URL.revokeObjectURL(liveUrls.current.crop);
      if (liveUrls.current.preview) {
        URL.revokeObjectURL(liveUrls.current.preview);
      }
    },
    []
  );

  const shownUrl =
    action.kind === 'set'
      ? action.previewUrl
      : action.kind === 'remove'
        ? null
        : currentUrl;

  async function handleFile(file: File) {
    setError(null);
    const problem = checkImageFile(file);
    if (problem) {
      setError(problem);
      return;
    }
    setLoading(true);
    try {
      setCropSrc(await toCroppableUrl(file));
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'No se ha podido abrir la imagen. Prueba con otra foto.'
      );
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  const openPicker = () => inputRef.current?.click();

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  }

  function undoChange() {
    if (action.kind === 'set') URL.revokeObjectURL(action.previewUrl);
    onChange({ kind: 'keep' });
  }

  return (
    <div>
      <span className="block text-sm font-semibold text-cream">Foto</span>
      <p className="mt-0.5 text-xs text-cream-mute">
        JPG, PNG, WebP o HEIC · máx. {MAX_INPUT_MB} MB · se recorta a 16:10.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void handleFile(f);
        }}
      />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!dragging) setDragging(true);
        }}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
            setDragging(false);
          }
        }}
        onDrop={handleDrop}
        className={cn(
          'relative mt-2 aspect-[16/10] w-full max-w-md overflow-hidden rounded-2xl border-2 border-dashed transition-colors',
          dragging
            ? 'border-amber bg-amber/10'
            : shownUrl
              ? 'border-hair'
              : 'border-hair-strong bg-white/[0.03] hover:border-amber/50 hover:bg-white/5'
        )}
      >
        {shownUrl ? (
          <>
            <button
              type="button"
              onClick={openPicker}
              aria-label="Cambiar la foto"
              className="absolute inset-0 h-full w-full"
            >
              <img
                src={shownUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            </button>

            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-end gap-2 bg-linear-to-t from-black/75 via-black/25 to-transparent p-3">
              <button
                type="button"
                onClick={openPicker}
                disabled={loading}
                className="pointer-events-auto inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-black/50 px-2.5 py-1.5 text-xs font-semibold text-cream backdrop-blur transition-colors hover:bg-black/70 disabled:opacity-50"
              >
                <RotateCcw size={13} aria-hidden="true" />
                {loading ? 'Abriendo…' : 'Cambiar'}
              </button>
              <button
                type="button"
                onClick={() => setConfirmRemove(true)}
                className="pointer-events-auto inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-black/50 px-2.5 py-1.5 text-xs font-semibold text-cream backdrop-blur transition-colors hover:border-brand-light hover:text-brand-light"
              >
                <Trash2 size={13} aria-hidden="true" />
                Quitar
              </button>
            </div>

            {loading ? (
              <div className="absolute inset-0 grid place-items-center bg-black/40">
                <Loader2
                  size={26}
                  className="animate-spin text-amber"
                  aria-hidden="true"
                />
              </div>
            ) : null}
            {dragging ? (
              <div className="pointer-events-none absolute inset-0 grid place-items-center bg-amber/15 text-sm font-semibold text-cream backdrop-blur-sm">
                Suelta para cambiar la foto
              </div>
            ) : null}
          </>
        ) : (
          <button
            type="button"
            onClick={openPicker}
            disabled={loading}
            className="flex h-full w-full flex-col items-center justify-center gap-2 px-4 text-center disabled:opacity-70"
          >
            {loading ? (
              <Loader2
                size={26}
                className="animate-spin text-amber"
                aria-hidden="true"
              />
            ) : (
              <span className="grid h-12 w-12 place-items-center rounded-full bg-amber/10 text-amber">
                <ImagePlus size={22} aria-hidden="true" />
              </span>
            )}
            <span className="text-sm font-semibold text-cream">
              {loading
                ? 'Abriendo…'
                : dragging
                  ? 'Suelta la foto aquí'
                  : 'Arrastra una foto o haz clic para elegir'}
            </span>
            <span className="text-xs text-cream-mute">
              Después la recortas a 16:10
            </span>
          </button>
        )}
      </div>

      {action.kind !== 'keep' ? (
        <button
          type="button"
          onClick={undoChange}
          className="mt-2 inline-flex items-center gap-1 text-xs text-cream-mute underline underline-offset-2 transition-colors hover:text-cream-dim"
        >
          <Undo2 size={12} aria-hidden="true" /> Deshacer cambio
        </button>
      ) : null}

      {error ? <p className="mt-1 text-xs text-brand-light">{error}</p> : null}

      <ConfirmDialog
        open={confirmRemove}
        onOpenChange={setConfirmRemove}
        title="Quitar la foto"
        description="La comida se quedará sin foto (se mostrará el logo). Puedes volver a subir otra cuando quieras."
        confirmLabel="Quitar"
        busyLabel="Quitando…"
        onConfirm={() => {
          if (action.kind === 'set') URL.revokeObjectURL(action.previewUrl);
          onChange({ kind: 'remove' });
          setConfirmRemove(false);
        }}
      />

      {cropSrc ? (
        <CropDialog
          imageSrc={cropSrc}
          onCancel={() => {
            URL.revokeObjectURL(cropSrc);
            setCropSrc(null);
          }}
          onCropped={(blob) => {
            URL.revokeObjectURL(cropSrc);
            setCropSrc(null);
            if (action.kind === 'set') URL.revokeObjectURL(action.previewUrl);
            onChange({
              kind: 'set',
              blob,
              previewUrl: URL.createObjectURL(blob),
            });
          }}
        />
      ) : null}
    </div>
  );
}
