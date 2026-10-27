import { Product } from './types';
import { PRODUCTS } from './data';

/**
 * Configuración que el plugin de WordPress inyecta en la página.
 * Si no existe (por ejemplo con `npm run dev`), la app usa el catálogo local de data.ts.
 */
declare global {
  interface Window {
    HORECA_WP?: {
      restUrl: string;
      siteUrl?: string;
    };
  }
}

export const isWordPress = (): boolean =>
  typeof window !== 'undefined' && !!window.HORECA_WP?.restUrl;

const BRANDS: Product['brand'][] = ['artiq', 'baristico', 'carimali', 'bellezza', 'eureka'];
const CATEGORIES: Product['category'][] = ['granizadora', 'hielo', 'dispensador', 'cafe', 'molino'];

function isValidProduct(p: any): p is Product {
  return (
    p &&
    typeof p.id === 'string' &&
    typeof p.name === 'string' &&
    typeof p.price === 'number' &&
    BRANDS.includes(p.brand) &&
    CATEGORIES.includes(p.category)
  );
}

export interface QuoteRequest {
  nombre: string;
  whatsapp: string;
  correo: string;
  items: { productId: string; wcId?: number; quantity: number }[];
  /** De dónde viene la solicitud (ej. "popup"); se ve en el aviso al equipo. */
  origen?: string;
  /** Campo trampa para bots. */
  empresa_web?: string;
}

/**
 * Envía una solicitud de cotización a WordPress (se guarda y se envían los correos).
 * Fuera de WordPress (vista previa) solo simula el envío.
 */
export async function sendQuoteRequest(data: QuoteRequest): Promise<{ ok: true; referencia: string } | { ok: false; message: string }> {
  const fallbackRef = 'SOL-' + Math.floor(1000 + Math.random() * 9000);
  if (!isWordPress()) {
    return { ok: true, referencia: fallbackRef };
  }
  try {
    const res = await fetch(`${window.HORECA_WP!.restUrl}solicitudes`, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(data),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok || !body?.ok) {
      return { ok: false, message: body?.message || 'No pudimos enviar tu solicitud. Revisa tu conexión e inténtalo de nuevo.' };
    }
    return { ok: true, referencia: body.referencia || fallbackRef };
  } catch {
    return { ok: false, message: 'No pudimos enviar tu solicitud. Revisa tu conexión e inténtalo de nuevo.' };
  }
}

/**
 * Trae los productos desde WooCommerce y reemplaza el catálogo local.
 * WooCommerce es la fuente de verdad: precios, nombres, fotos y descripciones
 * que se editen en WordPress aparecen aquí al recargar la página.
 */
export async function syncProductsFromWooCommerce(): Promise<void> {
  if (!isWordPress()) return;

  try {
    const res = await fetch(`${window.HORECA_WP!.restUrl}productos`, {
      credentials: 'same-origin',
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data: unknown = await res.json();

    // Capacidad diaria de respaldo: si el producto de WooCommerce no la tiene llena,
    // se usa la del catálogo original de la app (mismo ID).
    const localCapacity = new Map(
      PRODUCTS.filter((p) => p.dailyCapacity).map((p) => [p.id, p.dailyCapacity!])
    );
    const validCapacity = (c: any) =>
      c && typeof c.max === 'number' && c.max > 0 &&
      typeof c.comfortMin === 'number' && typeof c.comfortMax === 'number';

    const remote = Array.isArray(data)
      ? data
          .filter(isValidProduct)
          .map((p) => ({
            ...p,
            specs: Array.isArray(p.specs) ? p.specs : [],
            features: Array.isArray(p.features) ? p.features : [],
            rating: typeof p.rating === 'number' ? p.rating : 4.5,
            gallery: Array.isArray(p.gallery) ? p.gallery : [],
            dailyCapacity: validCapacity(p.dailyCapacity) ? p.dailyCapacity : localCapacity.get(p.id),
          }))
      : [];

    if (remote.length > 0) {
      PRODUCTS.splice(0, PRODUCTS.length, ...remote);
    } else {
      console.warn('[Horeca] WooCommerce no devolvió productos; se usa el catálogo local.');
    }
  } catch (err) {
    console.warn('[Horeca] No se pudieron cargar los productos de WooCommerce; se usa el catálogo local.', err);
  }
}
