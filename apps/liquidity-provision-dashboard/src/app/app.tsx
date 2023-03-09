import type { InMemoryCacheConfig } from '@apollo/client';
import { NetworkLoader, useInitializeEnv } from '@vegaprotocol/environment';
import { useRoutes } from 'react-router-dom';

import '../styles.scss';
import { Navbar } from './components/navbar';

import { routerConfig } from './routes/router-config';

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
const AppRouter = () => useRoutes(routerConfig);

export function App() {
  useInitializeEnv();
  return (
    <NetworkLoader cache={cache}>
      <div className="max-h-full min-h-full bg-white">
        <Navbar />
        <AppRouter />
      </div>
    </NetworkLoader>
  );
}

export default App;
