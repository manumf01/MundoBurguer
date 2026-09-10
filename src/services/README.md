# services/

Capa de acceso a datos externos. **Hoy no se usa**: Mundo Burguer es una web
informativa y todos los datos son estáticos (`src/config`, `src/features/*/data`).

## Cuando llegue el backend (pedidos / reservas)

1. Define `VITE_API_URL` en `.env`.
2. Activa el flag correspondiente en `src/config/features.ts`
   (`onlineOrdering`, `reservations`).
3. Crea `src/services/http.ts` con un cliente `fetch` mínimo (ver plantilla
   abajo).
4. Crea el feature: `src/features/cart/`, `src/features/checkout/`,
   `src/features/reservations/` con sus propios `components/`, `hooks/`, `data/`
   y `api.ts` que use `request()` de `http.ts`.
5. Añade la ruta en `src/app/router.tsx` (ya hay un bloque `futureRoutes`
   condicionado por el flag).
6. La carta ya está desacoplada: los componentes solo consumen el hook
   `useMenu()`, así que mover `data/menu.ts` a un CMS o API no toca la UI.

Plantilla de `http.ts`:

```ts
const BASE_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

export class HttpError extends Error {
  readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

export async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new HttpError(
      body?.message ?? response.statusText ?? 'La petición ha fallado',
      response.status
    );
  }
  return (await response.json()) as T;
}
```

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
