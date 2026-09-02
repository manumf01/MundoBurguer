/**
 * Cliente HTTP genérico. Hoy no se usa: la web es informativa y todos los
 * datos (carta, contacto) viven en src/config y en los datos de cada feature.
 *
 * Punto de extensión para el futuro (pedidos online, reservas): ver
 * src/services/README.md.
 */

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
