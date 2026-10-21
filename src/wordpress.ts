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
    const remote = Array.isArray(data)
      ? data
          .filter(isValidProduct)
          .map((p) => ({
            ...p,
            specs: Array.isArray(p.specs) ? p.specs : [],
            features: Array.isArray(p.features) ? p.features : [],
            rating: typeof p.rating === 'number' ? p.rating : 4.5,
            gallery: Array.isArray(p.gallery) ? p.gallery : [],
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
