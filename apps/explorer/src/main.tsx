import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import './styles.css';

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

ReactDOM.render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
  document.getElementById('root')
);
