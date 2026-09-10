-- ============================================================================
-- Fase 6d · 0011 · Ampliar formatos del bucket de imágenes
-- ============================================================================
-- El panel recorta la imagen en el navegador y la exporta a WebP; pero Safari
-- de iOS a veces no puede generar WebP desde <canvas> y devuelve JPEG/PNG. Se
-- admiten los tres para que la subida no falle desde iPhone.

update storage.buckets
   set allowed_mime_types = array['image/webp', 'image/jpeg', 'image/png'],
       file_size_limit = 5242880  -- 5 MB
 where id = 'menu';
