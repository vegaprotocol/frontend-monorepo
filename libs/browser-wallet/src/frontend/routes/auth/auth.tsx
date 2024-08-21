import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';

import { ModalWrapper } from '@/components/modals';
import { NavBar } from '@/components/navbar';
import { useJsonRpcClient } from '@/contexts/json-rpc/json-rpc-context';
import { useAssetsStore } from '@/stores/assets-store';
import { useConnectionStore } from '@/stores/connections';
import { useMarketsStore } from '@/stores/markets-store';
import { useWalletStore } from '@/stores/wallets';

export const Auth = () => {
  const { request } = useJsonRpcClient();

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

  useEffect(() => {
    loadWallets(request);
    loadConnections(request);
  }, [request, loadWallets, loadConnections]);

  // TODO: Remove
  // HACK: This is work around to ensure that the wallets are loaded before network requests.
  // Ideally the backend should be capable of doing this in parallel, but increases perceived performance for now.
  useEffect(() => {
    if (!loadingWallets && !loadingConnections) {
      loadAssets(request);
      loadMarkets(request);
    }
  }, [loadingConnections, loadAssets, loadMarkets, loadingWallets, request]);

  // Only render the UI if the wallets and networks have loaded
  if (loadingWallets) return null;

  return (
    <div className="h-full w-full grid grid-rows-[1fr_min-content] bg-surface-0 text-surface-0-fg">
      <ModalWrapper />
      <section className="w-full h-full overflow-y-auto">
        <div className="px-5 pt-3">
          <Outlet />
        </div>
      </section>
      <NavBar />
    </div>
  );
};
