import { useCallback, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import Cropper, { type Area } from 'react-easy-crop';
import 'react-easy-crop/react-easy-crop.css';
import { Button } from '@/components/ui';
import { cropToImage, IMAGE_ASPECT } from '@/features/admin';

export function CropDialog({
  imageSrc,
  onCancel,
  onCropped,
}: {
  imageSrc: string;
  onCancel: () => void;
  onCropped: (blob: Blob) => void;
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [pixels, setPixels] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onCropComplete = useCallback((_: Area, areaPixels: Area) => {
    setPixels(areaPixels);
  }, []);

  async function handleConfirm() {
    if (!pixels) return;
    setBusy(true);
    setError(null);
    try {
      onCropped(await cropToImage(imageSrc, pixels));
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'No se ha podido recortar la imagen.'
      );
      setBusy(false);
    }
  }

  return (
    <Dialog.Root open onOpenChange={(o) => !o && onCancel()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" />
        <Dialog.Content className="anim-popover fixed left-1/2 top-1/2 z-50 w-[min(34rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-hair bg-bg-elevated p-5 shadow-2xl">
          <Dialog.Title className="font-display text-lg tracking-wide text-cream">
            Recorta la foto
          </Dialog.Title>
          <Dialog.Description className="mt-1 text-xs text-cream-mute">
            Arrastra para reencuadrar y usa el control para acercar. Se guarda
            en formato 16:10.
          </Dialog.Description>

          <div className="relative mt-4 aspect-[16/10] w-full overflow-hidden rounded-xl bg-bg">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={IMAGE_ASPECT}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              showGrid={false}
            />
          </div>

          <label className="mt-3 flex items-center gap-3 text-xs text-cream-mute">
            Zoom
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 accent-amber"
              aria-label="Zoom"
            />
          </label>

          {error ? (
            <p className="mt-2 text-xs text-brand-light">{error}</p>
          ) : null}

          <div className="mt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => void handleConfirm()}
              disabled={busy || !pixels}
            >
              {busy ? 'Recortando…' : 'Usar esta foto'}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
