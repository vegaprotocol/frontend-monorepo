import classnames from 'classnames';
import { useState, useEffect } from 'react';
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import { useLocation } from 'react-router-dom';
import {
  EnvironmentProvider,
  NetworkLoader,
  useEnvironment,
} from '@vegaprotocol/environment';
import { NetworkInfo } from '@vegaprotocol/network-info';
import { Nav } from './components/nav';
import { Header } from './components/header';
import { Main } from './components/main';
import { TendermintWebsocketProvider } from './contexts/websocket/tendermint-websocket-provider';
import { ENV } from './config/env';
import type { InMemoryCacheConfig } from '@apollo/client';

function App() {
  const { VEGA_ENV } = useEnvironment();
  const [menuOpen, setMenuOpen] = useState(false);

  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  useEffect(() => {
    Sentry.init({
      dsn: ENV.dsn,
      integrations: [new BrowserTracing()],
      tracesSampleRate: 1,
      environment: VEGA_ENV,
    });
  }, [VEGA_ENV]);

  const cacheConfig: InMemoryCacheConfig = {
    typePolicies: {
      Node: {
        keyFields: false,
      },
    },
  };

  const layoutClasses = classnames(
    'grid grid-rows-[auto_1fr_auto] grid-cols-[1fr] md:grid-rows-[auto_minmax(700px,_1fr)_auto] md:grid-cols-[300px_1fr]',
    'min-h-[100vh] mx-auto my-0',
    'border-neutral-700 dark:border-neutral-300 lg:border-l lg:border-r',
    'bg-white dark:bg-black',
    'antialiased text-black dark:text-white',
    {
      'h-[100vh] min-h-auto overflow-hidden': menuOpen,
    }
  );

  return (
    <TendermintWebsocketProvider>
      <NetworkLoader cache={cacheConfig}>
        <div className={layoutClasses}>
          <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
          <Nav menuOpen={menuOpen} />
          <Main />
          <footer className="grid grid-rows-2 grid-cols-[1fr_auto] text-sm md:text-md md:flex md:col-span-2 p-4 gap-4 border-t border-neutral-700 dark:border-neutral-300">
            <NetworkInfo />
          </footer>
        </div>
      </NetworkLoader>
    </TendermintWebsocketProvider>
  );
}

const Wrapper = () => {
  return (
    <EnvironmentProvider>
      <App />
    </EnvironmentProvider>
  );
};

export default Wrapper;
