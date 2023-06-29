import {
  AppFailure,
  NetworkLoader,
  NodeGuard,
  NodeSwitcherDialog,
  useEnvironment,
  useInitializeEnv,
  useNodeSwitcherStore,
} from '@vegaprotocol/environment';
import { TendermintWebsocketProvider } from './contexts/websocket/tendermint-websocket-provider';
import { Loader, Splash } from '@vegaprotocol/ui-toolkit';
import { DEFAULT_CACHE_CONFIG } from '@vegaprotocol/apollo-client';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes/router-config';
import { t } from '@vegaprotocol/i18n';
import { Suspense } from 'react';

const splashLoading = (
  <Splash>
    <Loader />
  </Splash>
);

function App() {
  const { VEGA_URL } = useEnvironment();
  const [nodeSwitcherOpen, setNodeSwitcherOpen] = useNodeSwitcherStore(
    (store) => [store.dialogOpen, store.setDialogOpen]
  );
  return (
    <TendermintWebsocketProvider>
      <NetworkLoader cache={DEFAULT_CACHE_CONFIG}>
        <NodeGuard
          skeleton={<div>{t('Loading')}</div>}
          failure={<AppFailure title={t(`Node: ${VEGA_URL} is unsuitable`)} />}
        >
          <Suspense fallback={splashLoading}>
            <RouterProvider router={router} fallbackElement={splashLoading} />
          </Suspense>
        </NodeGuard>
        <NodeSwitcherDialog
          open={nodeSwitcherOpen}
          setOpen={setNodeSwitcherOpen}
        />
      </NetworkLoader>
    </TendermintWebsocketProvider>
  );
}

const Wrapper = () => {
  useInitializeEnv();
  return <App />;
};

export default Wrapper;
