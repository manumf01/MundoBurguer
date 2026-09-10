# supabase/

Esquema de base de datos, políticas RLS y almacenamiento de la parte privada
de administración (`/panel`). El frontend sigue siendo un build estático de
Vite; esto vive **solo** en el proyecto Supabase y es independiente del
hosting.

## Contenido

```
migrations/
  20260909090001_helpers.sql         Utilidad set_updated_at
  20260909090002_identity.sql        profiles, bootstrap_admins, trigger de alta,
                                     is_admin() / is_approved_staff(), ensure_profile()
  20260909090003_menu.sql            categories, products, menu_config_* + validaciones
  20260909090004_audit.sql           audit_log + triggers de auditoría
  20260909090005_rls.sql             RLS + grants de todas las tablas
  20260909090006_storage.sql         bucket 'menu' (WebP, público de lectura)
  20260909090007_bootstrap_admin.sql tu correo como admin + backfill
  20260909090008_fix_audit_function  arregla write_audit() (tablas sin deleted_at)
  20260909090009_reorder_and_audit   reorder_products() + no auditar cambios de solo orden
  20260909090010_price_note_and_popular  nota de precio a 50 · destacado ⇒ popular
  20260909090011_storage_mime            bucket admite webp/jpeg/png (iPhone) · 5 MB
  20260909090012_reorder_more            reorder_categories() + reorder_featured()
  20260909090013_menu_config_groups      bloques editables + DELETE que faltaba en items
  20260909090014_product_config          configurador: selection en bloques, delta negativo,
                                         product_config_groups, descuentos sin patatas/bebida
  20260909090015_config_auto_categories  bloques automáticos por categoría (auto_categories)
                                         + bloque "Elige tu hamburguesa" (Premium)
  20260909090016_pollo_crujiente_and_featured_cap  "Pollo crujiente" en "Elige tu hamburguesa"
                                                   + máx. 4 destacados
  20260909090017_profiles_admin_safety  no bloquearte a ti mismo · siempre 1 admin
  20260909090018_profiles_last_seen  columna last_seen_at + RPC touch_last_seen()
```

## Cómo aplicarlas

### Opción A — SQL Editor (recomendada, sin instalar nada)

1. Supabase → **SQL Editor** → _New query_.
2. Abre cada fichero de `migrations/` **en orden** (0001 → 0018), pega su
   contenido y pulsa **Run**. Uno por uno.
3. Los ficheros son re-ejecutables (usan `create ... if not exists`,
   `create or replace`, `drop policy if exists`): si algo falla a mitad,
   corrige y vuelve a lanzar el fichero entero.

> **Si ya aplicaste 0001–0007 antes de este arreglo**, basta con ejecutar
> `20260909090008_fix_audit_function.sql` (o `supabase db push`, que lo
> detecta como migración nueva). Corrige el error
> `record "new" has no field "deleted_at"` al guardar "Configura tu Menú".
> `0004` NO se toca: `db push` no re-aplica migraciones ya registradas.

> **Nota sobre el paso 0002.** La línea
> `create trigger on_auth_user_created ... on auth.users` puede fallar si la
> plataforma no concede permiso sobre `auth.users` en tu proyecto. Si ocurre:
> borra esa sentencia `create trigger` (deja todo lo demás) y vuelve a lanzar
> el fichero. El alta del perfil queda cubierta por `ensure_profile()`, que la
> app llama tras el login.

### Opción B — Supabase CLI

```cmd
npm i -g supabase
supabase login
supabase link --project-ref <REF>
supabase db push
```

Los nombres `AAAAMMDDHHMMSS_*.sql` ya tienen el formato que espera el CLI.
`db push` aplica solo las migraciones pendientes y las registra en
`supabase_migrations.schema_migrations` — por eso las migraciones ya
aplicadas **no se editan**; los arreglos van en un fichero nuevo.

> Si el trigger sobre `auth.users` (0002) no se puede crear por permisos,
> `db push` fallará en esa sentencia. Comenta esa línea `create trigger` en
> `20260909090002_identity.sql`, vuelve a hacer `db push`, y descoméntala
> luego (no volverá a intentarse). `ensure_profile()` cubre el alta igual.

## Verificación rápida

Pega esto en el SQL Editor tras aplicar todo; debe devolver una fila con
`ok = true`:

```sql
select
  (select count(*) from information_schema.tables
     where table_schema = 'public'
       and table_name in ('profiles','bootstrap_admins','categories',
         'products','menu_config_meta','menu_config_items','audit_log')) = 7
  and (select count(*) from public.menu_config_meta) = 1
  and (select count(*) from public.bootstrap_admins
         where email = 'manumoriles3012@gmail.com' and role = 'admin') = 1
  and (select bool_and(rowsecurity) from pg_tables
         where schemaname = 'public'
           and tablename in ('profiles','categories','products',
             'menu_config_meta','menu_config_items','audit_log'))
  and exists (select 1 from storage.buckets where id = 'menu')
  as ok;
```

Tras iniciar sesión por primera vez con Google en la app (Fase 3), comprueba tu
rol:

```sql
select email, status, role from public.profiles order by requested_at;
```

## Modelo de datos (resumen)

| Tabla                   | Para qué                                                                                                                                                 |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `profiles`              | Una fila por cuenta Google que intentó entrar. `status` (pending/approved/denied) + `role` (admin/editor).                                               |
| `bootstrap_admins`      | Correos con acceso preconcedido. Solo SQL / service_role.                                                                                                |
| `categories`            | Categorías de la carta. Slug único, `sort_order`, `deleted_at` (borrado lógico).                                                                         |
| `products`              | Comidas. Precio único **o** `variants` **o** `tiers` (exactamente uno). `visible`, `is_featured`+`featured_order` (máx. 4), `deleted_at`.                |
| `menu_config_meta`      | Fila única: `heading`, `option_allergens`, y los descuentos del combo `no_fries_delta` / `no_drink_delta` + `combo_category_slug`.                       |
| `menu_config_groups`    | Bloques de "Configura tu Menú". `selection` (info / single / multiple), `style`, `sort_order`, `auto_categories` (slugs donde el bloque se aplica solo). |
| `menu_config_items`     | Opciones de cada bloque (`group_id`): `title`, `detail`, `delta` (puede ser negativo = descuento), `sort_order`.                                         |
| `product_config_groups` | Qué bloques de opciones ve cada producto en su vista de detalle (`product_id` × `group_id`).                                                             |
| `audit_log`             | Quién/cuándo/qué. Lo escriben triggers; lo lee solo el admin.                                                                                            |

### Datos derivados del frontend

- `src/features/menu/data/menu.snapshot.json` — copia estática de la carta
  (fallback si el backend no responde). Regénéralo con **`pnpm gen:snapshot`**
  (desde la BD) tras cambios en el panel.
- `public/sitemap.xml` — se regenera junto al snapshot (una URL `/carta/<slug>`
  por producto). También suelto: **`pnpm gen:sitemap`**.

### Autorización (RLS)

- **Lectura pública** (`anon`): categorías y productos **no borrados**;
  productos además **visibles**. `menu_config_*` es público entero.
- **Staff aprobado** (`admin`/`editor`): lee todo y puede `insert`/`update`.
- **Borrado físico**: no se concede por API. El panel marca `deleted_at`.
  Purgar de verdad = SQL / dashboard con `service_role`.
- **`profiles`**: cada usuario lee su fila; el `admin` lee y actualiza todas
  (aprobar/denegar/rol).
- **Storage** (`menu`): lectura pública; `insert`/`update`/`delete` solo staff
  aprobado. El bucket admite `image/webp` / `jpeg` / `png` ≤ 5 MB
  (ampliado en la migración 0011; antes solo WebP ≤ 3 MB).

## Reset (⚠️ borra todos los datos del panel)

```sql
drop table if exists
  public.audit_log, public.menu_config_items, public.menu_config_meta,
  public.products, public.categories, public.profiles,
  public.bootstrap_admins cascade;
-- Y en Storage: borra el bucket 'menu' desde el dashboard si quieres empezar
-- también las imágenes de cero.
```
