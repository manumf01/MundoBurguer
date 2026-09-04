# assets/brand

Material de marca de Mundo Burguer.

| Archivo             | Origen                                                                | Notas                                                                                                                              |
| -------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `eslogan.webp`       | `src/docs/eslogan.png` (convertido)                                   | Eslogan oficial con corona. Se usa en el hero de inicio.                                                                           |
| `logo.webp`          | `src/docs/logo-sinfondo.jpg` (fondo de cuadros eliminado por script)  | Logo oficial en color, con transparencia. Es el que pinta `BrandLogo` (variant `badge`): navbar, pie, menú móvil y "Sobre nosotros" (en grande). |
| `logo-pattern.webp`  | `src/docs/logoblanco.png` (recortado a su caja)                       | Versión monocroma blanca del logo, solo para el patrón repetido de fondo (`.bg-logo-pattern` en `src/styles/index.css`).            |

La marca del navbar, el pie y el menú móvil se dibuja con
`src/components/common/BrandLogo.tsx` (`variant="badge"` = logo oficial en
imagen, `variant="wordmark"` = nombre en texto con la tipografía de la web).

## Pendiente de aportar por el cliente

- Logo oficial en vectorial (`.svg`), si existe, para sustituir el recorte
  rasterizado de `logo.webp` y afinar bordes a cualquier tamaño.
- `public/og-image.jpg` (1200×630) para compartir en redes.
- Fotografía real de producto y del local (opcional; la carta física no lleva
  fotos por plato y la web sigue ese criterio).
