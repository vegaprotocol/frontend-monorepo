import { NetworkLoader, useInitializeEnv } from '@vegaprotocol/environment';
import { TendermintWebsocketProvider } from './contexts/websocket/tendermint-websocket-provider';
import { Loader, Splash } from '@vegaprotocol/ui-toolkit';
import { DEFAULT_CACHE_CONFIG } from '@vegaprotocol/apollo-client';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes/router-config';

const splashLoading = (
  <Splash>
    <Loader />
  </Splash>
);

function App() {
  return (
    <TendermintWebsocketProvider>
      <NetworkLoader cache={DEFAULT_CACHE_CONFIG}>
        <RouterProvider router={router} fallbackElement={splashLoading} />
      </NetworkLoader>
    </TendermintWebsocketProvider>
  );
}

const Wrapper = () => {
  useInitializeEnv();
  return <App />;
};

export default Wrapper;
