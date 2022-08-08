import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './styles.css';

import App from './app/app';
import { ENV } from './app/config/env';
import { StrictMode } from 'react';

const { dsn } = ENV;

/* istanbul ignore next */
if (dsn) {
  Sentry.init({
    dsn,
    integrations: [new BrowserTracing()],
    tracesSampleRate: 1,
    environment: ENV.envName,
  });
}
const rootElement = document.getElementById('root');
const root = rootElement && createRoot(rootElement);

root?.render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
