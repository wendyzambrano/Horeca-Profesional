import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

/**
 * Build para WordPress: genera wp-plugin/horeca-profesional/build/app.js y app.css
 * con nombres fijos para que el plugin los cargue.
 * Uso: npm run build:wp
 */
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  publicDir: false,
  build: {
    outDir: 'wp-plugin/horeca-profesional/build',
    emptyOutDir: true,
    cssCodeSplit: false,
    rollupOptions: {
      input: path.resolve(__dirname, 'src/main.tsx'),
      output: {
        format: 'iife',
        entryFileNames: 'app.js',
        assetFileNames: (info) =>
          (info.names?.[0] ?? info.name ?? '').endsWith('.css') ? 'app.css' : 'assets/[name]-[hash][extname]',
        inlineDynamicImports: true,
      },
    },
  },
});
