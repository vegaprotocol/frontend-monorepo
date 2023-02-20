import classnames from 'classnames';
import { NetworkLoader, useInitializeEnv } from '@vegaprotocol/environment';
import { Nav } from './components/nav';
import { Header } from './components/header';
import { Main } from './components/main';
import { TendermintWebsocketProvider } from './contexts/websocket/tendermint-websocket-provider';
import { Footer } from './components/footer/footer';
import { AnnouncementBanner, ExternalLink } from '@vegaprotocol/ui-toolkit';
import {
  AssetDetailsDialog,
  useAssetDetailsDialogStore,
} from '@vegaprotocol/assets';
import { DEFAULT_CACHE_CONFIG } from '@vegaprotocol/apollo-client';

const DialogsContainer = () => {
  const { isOpen, id, trigger, asJson, setOpen } = useAssetDetailsDialogStore();
  return (
    <AssetDetailsDialog
      assetId={id}
      trigger={trigger || null}
      asJson={asJson}
      open={isOpen}
      onChange={setOpen}
    />
  );
};

function App() {
  const layoutClasses = classnames(
    'grid grid-rows-[auto_1fr_auto] grid-cols-[1fr] md:grid-rows-[auto_minmax(700px,_1fr)_auto] md:grid-cols-[300px_1fr]',
    'min-h-[100vh] mx-auto my-0',
    'border-neutral-700 dark:border-neutral-300 lg:border-l lg:border-r',
    'bg-white dark:bg-black',
    'antialiased text-black dark:text-white',
    'overflow-hidden relative'
  );

  return (
    <TendermintWebsocketProvider>
      <NetworkLoader cache={DEFAULT_CACHE_CONFIG}>
        <AnnouncementBanner>
          <div className="font-alpha calt uppercase text-center text-lg text-white">
            <span className="pr-4">Mainnet sim 2 coming in March!</span>
            <ExternalLink href="https://fairground.wtf/">
              Learn more
            </ExternalLink>
          </div>
        </AnnouncementBanner>

        <div className={layoutClasses}>
          <Header />
          <Nav />
          <Main />
          <Footer />
        </div>

        <DialogsContainer />
      </NetworkLoader>
    </TendermintWebsocketProvider>
  );
}

const Wrapper = () => {
  useInitializeEnv();
  return <App />;
};

export default Wrapper;
