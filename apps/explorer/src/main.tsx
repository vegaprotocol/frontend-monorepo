import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import { StrictMode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import './styles.css';
import { createRoot } from 'react-dom/client';

import App from './app/app';
import { ENV } from './app/config/env';

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

const container = document.getElementById('root');
// React docs: createRoot(container!) if we use TypeScript
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(container!);

root.render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
