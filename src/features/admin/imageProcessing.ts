export const IMAGE_ASPECT = 16 / 10;
/** Tope de la foto de entrada (fotos de móvil). Fuente única para UI y validación. */
export const MAX_INPUT_MB = 15;
const MAX_INPUT_BYTES = MAX_INPUT_MB * 1024 * 1024;
const OUTPUT_WIDTH = 1200;
const OUTPUT_QUALITY = 0.82;

const ACCEPTED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
]);

export interface PixelCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Valida tipo y tamaño. Devuelve un mensaje de error o `null` si es válido. */
export function checkImageFile(file: File): string | null {
  const looksHeic = /\.(heic|heif)$/i.test(file.name);
  if (!looksHeic && file.type && !ACCEPTED_TYPES.has(file.type)) {
    return `Ese tipo de archivo (${file.type}) no se admite. Usa una foto JPG, PNG, WebP o HEIC.`;
  }
  if (file.size > MAX_INPUT_BYTES) {
    return `La foto pesa demasiado (máx. ${MAX_INPUT_MB} MB). Prueba con una versión más ligera.`;
  }
  return null;
}

/**
 * Prepara el fichero para el recorte. Los HEIC (iPhone) no los decodifican
 * Chrome/Firefox, así que se convierten a JPEG con `heic2any` (carga diferida).
 * Devuelve un object URL que el llamador debe revocar al terminar.
 */
export async function toCroppableUrl(file: File): Promise<string> {
  const isHeic =
    file.type === 'image/heic' ||
    file.type === 'image/heif' ||
    /\.(heic|heif)$/i.test(file.name);

  if (!isHeic) return URL.createObjectURL(file);

  try {
    const { default: heic2any } = await import('heic2any');
    const out = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.9,
    });
    const blob = Array.isArray(out) ? out[0] : out;
    return URL.createObjectURL(blob as Blob);
  } catch {
    throw new Error(
      'No se ha podido convertir la foto de iPhone (HEIC). Prueba a hacer una captura o a exportarla como JPG.'
    );
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () =>
      reject(new Error('No se ha podido leer la imagen. Prueba con otra.'));
    img.src = src;
  });
}

function toBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

/**
 * Recorta la región indicada y devuelve la imagen ~1200px de ancho. Intenta
 * WebP; si el navegador no lo genera (Safari de iOS a veces), cae a JPEG. El
 * `blob.type` resultante indica el formato real.
 */
export async function cropToImage(
  imageSrc: string,
  crop: PixelCrop
): Promise<Blob> {
  const image = await loadImage(imageSrc);

  const scale = Math.min(1, OUTPUT_WIDTH / crop.width);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(crop.width * scale);
  canvas.height = Math.round(crop.height * scale);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('No se ha podido procesar la imagen en este navegador.');
  }
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    canvas.width,
    canvas.height
  );

  const webp = await toBlob(canvas, 'image/webp', OUTPUT_QUALITY);
  if (webp && webp.type === 'image/webp') return webp;

  const jpeg = await toBlob(canvas, 'image/jpeg', 0.85);
  if (jpeg) return jpeg;

  throw new Error('No se ha podido guardar la imagen. Prueba con otra foto.');
}
