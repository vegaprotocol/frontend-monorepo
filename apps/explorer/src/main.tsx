import { createRoot } from 'react-dom/client';
import './styles.css';

import App from './app/app';
import { StrictMode } from 'react';

const rootElement = document.getElementById('root');
const root = rootElement && createRoot(rootElement);

root?.render(
  <StrictMode>
    <App />
  </StrictMode>
);
