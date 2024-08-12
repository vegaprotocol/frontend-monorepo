import { Outlet /*, useMatch */ } from 'react-router-dom';
import { useEffect } from 'react';

// import { DappsHeader } from '@/components/dapps-header';
import { ModalWrapper } from '@/components/modals';
import { NavBar } from '@/components/navbar';
import { PageHeader } from '@/components/page-header';
import { useJsonRpcClient } from '@/contexts/json-rpc/json-rpc-context';
import { useNetwork } from '@/contexts/network/network-context';
import { useAssetsStore } from '@/stores/assets-store';
import { useConnectionStore } from '@/stores/connections';
// import { useGlobalsStore } from '@/stores/globals';
import { useMarketsStore } from '@/stores/markets-store';
// import { useNetworksStore } from '@/stores/networks-store';
import { useWalletStore } from '@/stores/wallets';

// import { FULL_ROUTES } from '../route-names';

export const Auth = () => {
  const { request } = useJsonRpcClient();
  const { network } = useNetwork();

  // Wallets store
  const { loadWallets, loading: loadingWallets } = useWalletStore((state) => ({
    loadWallets: state.loadWallets,
    loading: state.loading,
  }));

  // Assets store
  const { loadAssets } = useAssetsStore((state) => ({
    loadAssets: state.fetchAssets,
  }));

  // Markets store
  const { loadMarkets } = useMarketsStore((state) => ({
    loadMarkets: state.fetchMarkets,
  }));

  // Connections store
  const { loading: loadingConnections, loadConnections } = useConnectionStore(
    (state) => ({
      loading: state.loading,
      loadConnections: state.loadConnections,
    })
  );

  // Networks store
  // const { loading: loadingNetworks } = useNetworksStore((state) => ({
  //   loading: state.loading,
  // }));

  // const isDesktop = useGlobalsStore((state) => !state.isMobile);

  useEffect(() => {
    loadWallets(request);
    loadConnections(request);
  }, [request, loadWallets, loadConnections]);

  // TODO: Remove
  // HACK: This is work around to ensure that the wallets are loaded before network requests.
  // Ideally the backend should be capable of doing this in parallel, but increases perceived performance for now.
  useEffect(() => {
    if (!loadingWallets && !loadingConnections) {
      loadAssets(request, network.id);
      loadMarkets(request, network.id);
    }
  }, [
    loadingConnections,
    loadAssets,
    loadMarkets,
    loadingWallets,
    network.id,
    request,
  ]);
  // const isWallets = !!useMatch(FULL_ROUTES.wallets);
  console.log(loadingWallets);
  // Only render the UI if the wallets and networks have loaded
  if (loadingWallets) return null;

  return (
    <div className="h-full w-full grid grid-rows-[min-content_1fr_min-content] bg-vega-dark-100">
      <ModalWrapper />
      <PageHeader />
      <section className="w-full h-full overflow-y-auto">
        <div className="px-5 pt-3">
          <Outlet />
        </div>
      </section>
      <NavBar />
    </div>
  );
};
