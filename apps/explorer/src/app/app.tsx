import classnames from 'classnames';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { EnvironmentProvider, NetworkLoader } from '@vegaprotocol/environment';
import { Nav } from './components/nav';
import { Header } from './components/header';
import { Main } from './components/main';
import { TendermintWebsocketProvider } from './contexts/websocket/tendermint-websocket-provider';
import type { InMemoryCacheConfig } from '@apollo/client';
import { Footer } from './components/footer/footer';
import { AnnouncementBanner, ExternalLink } from '@vegaprotocol/ui-toolkit';

function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  const cacheConfig: InMemoryCacheConfig = {
    typePolicies: {
      statistics: {
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
        <AnnouncementBanner>
          <div className="font-alpha calt uppercase text-center text-lg text-white">
            <span className="pr-4">The Mainnet sims are live!</span>
            <ExternalLink href="https://fairground.wtf/">
              Come help stress test the network
            </ExternalLink>
          </div>
        </AnnouncementBanner>

        <div className={layoutClasses}>
          <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
          <Nav menuOpen={menuOpen} />
          <Main />
          <Footer />
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
