import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { EnvironmentProvider, NetworkLoader } from '@vegaprotocol/environment';

import App from './app/app';
import type { InMemoryCacheConfig } from '@apollo/client';

const rootElement = document.getElementById('root');
const root = rootElement && createRoot(rootElement);
const cache: InMemoryCacheConfig = {
  typePolicies: {
    Market: {
      merge: true,
    },
    Party: {
      merge: true,
    },
    Query: {},
    Account: {
      keyFields: false,
      fields: {
        balanceFormatted: {},
      },
    },
    Node: {
      keyFields: false,
    },
    Instrument: {
      keyFields: false,
    },
  },
};
root?.render(
  <StrictMode>
    <BrowserRouter>
      <EnvironmentProvider>
        <NetworkLoader cache={cache}>
          <App />
        </NetworkLoader>
      </EnvironmentProvider>
    </BrowserRouter>
  </StrictMode>
);
