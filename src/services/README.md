# services/

Capa de acceso a datos externos. **Hoy no se usa**: Mundo Burguer es una web
informativa y todos los datos son estáticos (`src/config`, `src/features/*/data`).

## Cuando llegue el backend (pedidos / reservas)

1. Define `VITE_API_URL` en `.env`.
2. Activa el flag correspondiente en `src/config/features.ts`
   (`onlineOrdering`, `reservations`).
3. Crea el feature: `src/features/cart/`, `src/features/checkout/`,
   `src/features/reservations/` con sus propios `components/`, `hooks/`, `data/`
   y `api.ts` que use `request()` de `http.ts`.
4. Añade la ruta en `src/app/router.tsx` (ya hay un bloque `futureRoutes`
   condicionado por el flag).
5. La carta ya está desacoplada: los componentes solo consumen el hook
   `useMenu()`, así que mover `data/menu.ts` a un CMS o API no toca la UI.

Ejemplo de servicio futuro:

```ts
import { request } from '@/services/http';

export const OrdersApi = {
  create: (payload: NewOrder) =>
    request<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
```
