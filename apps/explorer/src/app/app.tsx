import { NetworkLoader, useEnvironment, useInitializeEnv } from '@vegaprotocol/environment';
import { Header } from './components/header';
import { Main } from './components/main';
import { TendermintWebsocketProvider } from './contexts/websocket/tendermint-websocket-provider';
import { Footer } from './components/footer/footer';
import { AnnouncementBanner } from '@vegaprotocol/announcements';
import {
  AssetDetailsDialog,
  useAssetDetailsDialogStore,
} from '@vegaprotocol/assets';
import { DEFAULT_CACHE_CONFIG } from '@vegaprotocol/apollo-client';
import classNames from 'classnames';
import { useState } from 'react';

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
  const { ANNOUNCEMENTS_CONFIG_URL } = useEnvironment()
  return (
    <TendermintWebsocketProvider>
      <NetworkLoader cache={DEFAULT_CACHE_CONFIG}>
        <div
          className={classNames(
            'max-w-[1500px] min-h-[100vh]',
            'mx-auto my-0',
            'grid grid-rows-[auto_1fr_auto] grid-cols-1',
            'border-vega-light-200 dark:border-vega-dark-200 lg:border-l lg:border-r',
            'antialiased text-black dark:text-white',
            'overflow-hidden relative'
          )}
        >
          <div>
            {ANNOUNCEMENTS_CONFIG_URL && (
              <AnnouncementBanner
                app="explorer"
                configUrl={ANNOUNCEMENTS_CONFIG_URL}
              />
            )}
            <Header />
          </div>
          <div>
            <Main />
          </div>
          <div>
            <Footer />
          </div>
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
