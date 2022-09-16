import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './app/app';

const rootElement = document.getElementById('root');
const root = rootElement && createRoot(rootElement);

root?.render(
  <StrictMode>
    <App />
  </StrictMode>
);
