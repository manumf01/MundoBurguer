-- ============================================================================
-- Fase 1 · 0006 · Storage: bucket de imágenes de la carta
-- ============================================================================
-- El panel siempre sube WebP ya optimizado (recorte + compresión en el
-- navegador), por eso el bucket solo admite image/webp y un tamaño pequeño.
-- Lectura pública; escritura solo para staff aprobado.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('menu', 'menu', true, 3145728, array['image/webp'])
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists menu_objects_public_read on storage.objects;
create policy menu_objects_public_read on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'menu');

drop policy if exists menu_objects_staff_insert on storage.objects;
create policy menu_objects_staff_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'menu' and public.is_approved_staff());

drop policy if exists menu_objects_staff_update on storage.objects;
create policy menu_objects_staff_update on storage.objects
  for update to authenticated
  using (bucket_id = 'menu' and public.is_approved_staff())
  with check (bucket_id = 'menu' and public.is_approved_staff());

drop policy if exists menu_objects_staff_delete on storage.objects;
create policy menu_objects_staff_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'menu' and public.is_approved_staff());
