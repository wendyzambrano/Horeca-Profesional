import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import {syncProductsFromWooCommerce} from './wordpress';
import './index.css';

// En WordPress el contenedor es #horeca-root; en local (npm run dev) es #root.
const rootElement = document.getElementById('horeca-root') ?? document.getElementById('root');

syncProductsFromWooCommerce().finally(() => {
  createRoot(rootElement!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
