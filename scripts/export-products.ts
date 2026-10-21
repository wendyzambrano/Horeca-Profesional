/**
 * Exporta el catálogo de src/data.ts a un JSON que el plugin usa
 * para la importación inicial de productos a WooCommerce.
 */
import {mkdirSync, writeFileSync} from 'fs';
import path from 'path';
import {PRODUCTS} from '../src/data';

const outDir = path.resolve(process.cwd(), 'wp-plugin/horeca-profesional/data');
mkdirSync(outDir, {recursive: true});
writeFileSync(path.join(outDir, 'productos-iniciales.json'), JSON.stringify(PRODUCTS, null, 2));
console.log(`Exportados ${PRODUCTS.length} productos a ${path.relative(process.cwd(), outDir)}/productos-iniciales.json`);
