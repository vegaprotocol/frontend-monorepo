import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeContext } from '@vegaprotocol/react-helpers';
import { EnvironmentProvider, NetworkLoader } from '@vegaprotocol/environment';
import { createClient } from './app/lib/apollo-client';

import App from './app/app';

const cache = new InMemoryCache({
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
  },
});
// https://api.n01.stagnet3.vega.xyz/graphql
// //api.n01.stagnet3.vega.xyz/graphql/
// //api.n07.testnet.vega.xyz/graphql/

// https://api.n08.testnet.vega.xyz/graphql

const client = new ApolloClient({
  uri: 'https://api.n01.stagnet3.vega.xyz/graphql',
  cache,
});

const rootElement = document.getElementById('root');
const root = rootElement && createRoot(rootElement);

root?.render(
  <StrictMode>
    <EnvironmentProvider>
      <ThemeContext.Provider value="light">
        <NetworkLoader createClient={createClient}>
          <App />
        </NetworkLoader>
      </ThemeContext.Provider>
    </EnvironmentProvider>
  </StrictMode>
);
