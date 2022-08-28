import { useState, useEffect } from 'react';
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import { useLocation } from 'react-router-dom';
import { ThemeContext, useThemeSwitcher } from '@vegaprotocol/react-helpers';
import {
  EnvironmentProvider,
  NetworkLoader,
  useEnvironment,
} from '@vegaprotocol/environment';
import { NetworkInfo } from '@vegaprotocol/network-info';
import { createClient } from './lib/apollo-client';
import { Nav } from './components/nav';
import { Header } from './components/header';
import { Main } from './components/main';
import { TendermintWebsocketProvider } from './contexts/websocket/tendermint-websocket-provider';
import { ENV } from './config/env';

function App() {
  const { VEGA_ENV } = useEnvironment();
  const [theme, toggleTheme] = useThemeSwitcher();
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

  return (
    <ThemeContext.Provider value={theme}>
      <TendermintWebsocketProvider>
        <NetworkLoader createClient={createClient}>
          <div
            className={`${
              menuOpen && 'h-[100vh] overflow-hidden'
            } antialiased m-0 bg-white dark:bg-black text-black dark:text-white`}
          >
            <div className="min-h-[100vh] max-w-[1300px] grid grid-rows-[repeat(2,_auto)_1fr] grid-cols-[1fr] md:grid-rows-[auto_minmax(700px,_1fr)] md:grid-cols-[300px_1fr] border-black dark:border-white lg:border-l lg:border-r mx-auto">
              <Header
                theme={theme}
                toggleTheme={toggleTheme}
                menuOpen={menuOpen}
                setMenuOpen={setMenuOpen}
              />
              <Nav menuOpen={menuOpen} />
              <Main />
              <footer className="grid grid-rows-2 grid-cols-[1fr_auto] text-sm md:text-md md:flex md:col-span-2 p-4 gap-4 border-t border-black dark:border-white">
                <NetworkInfo />
              </footer>
            </div>
          </div>
        </NetworkLoader>
      </TendermintWebsocketProvider>
    </ThemeContext.Provider>
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
