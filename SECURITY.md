# Seguridad

## Cómo reportar un problema

Escribe a **manumoriles3012@gmail.com** con el asunto `[seguridad]`. No abras un
issue público para vulnerabilidades.

## Modelo de amenazas (resumen)

- **Qué se protege:** la capacidad de **editar la carta** desde `/panel`. No
  hay datos de clientes, ni pagos, ni pedidos. La carta es pública por
  definición y su `VITE_SUPABASE_ANON_KEY` viaja en el bundle a propósito.
- **Superficie:** solo **2 cuentas** de Google (admin + editor). El resto de
  cuentas que hagan login quedan `pending` sin poder tocar nada hasta que el
  admin las apruebe.
- **Autorización real = RLS de Postgres**, no la UI. Lectura pública limitada a
  filas no borradas y visibles; escritura solo para staff aprobado;
  `service_role` nunca sale de la máquina del admin. Triggers de auditoría
  registran quién/cuándo/qué.
- **Salvaguardas de cuentas:** no puedes cambiarte tu propio acceso/rol y
  siempre debe quedar ≥1 admin (trigger en `profiles`). Cierre de sesión a los
  30 min de inactividad.
- **Riesgos aceptados:** XSS quedaría contenido por la CSP (`script-src`
  estricto, sin `unsafe-inline`/`eval`); `style-src 'unsafe-inline'` se admite
  porque React/animaciones necesitan estilos en atributos y el impacto es bajo.
  El comodín `*.supabase.co` en `connect-src`/`img-src` es aceptable: la anon
  key es pública y RLS es el control efectivo.
- **Fuera de alcance:** disponibilidad/DoS (lo cubre el hosting/CDN), phishing
  de la cuenta de Google del admin (2FA en Google), y el propio Supabase.

## Medidas implementadas

| Área         | Medida                                                                                                                                                                                                                           |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Transporte   | HSTS (`max-age` 1 año, `includeSubDomains`); `upgrade-insecure-requests`.                                                                                                                                                        |
| Cabeceras    | CSP, `X-Frame-Options: DENY` + `frame-ancestors 'none'`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (geo/cam/mic/pago/usb off). Ver [`DEPLOY.md`](./DEPLOY.md). |
| Auth         | Google OAuth (PKCE); sin email/contraseña; sesión persistida por Supabase con refresh; cierre por inactividad.                                                                                                                   |
| Autorización | RLS en todas las tablas; funciones `is_admin()` / `is_approved_staff()`; borrado lógico (`deleted_at`), sin `DELETE` físico por API.                                                                                             |
| Secretos     | Solo `VITE_*` (públicas) en el repo/hosting; `SUPABASE_SERVICE_ROLE_KEY` solo en `.env.local` (git-ignored).                                                                                                                     |
| Entrada      | Validación en cliente **y** constraints/`CHECK`/triggers en Postgres (precios, longitudes, tipos y tamaño de imagen, catálogo cerrado de alérgenos).                                                                             |
| Storage      | Bucket `menu` solo `image/webp                                                                                                                                                                                                   | jpeg | png` ≤ 5 MB; escritura solo staff. |
| Indexación   | `/panel` y `/acceso` en `noindex` + `Disallow` en `robots.txt`.                                                                                                                                                                  |
