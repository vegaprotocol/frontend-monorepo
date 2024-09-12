import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';

import { ModalWrapper } from '@/components/modals';
import { NavBar } from '@/components/navbar';
import { useJsonRpcClient } from '@/contexts/json-rpc/json-rpc-context';
import { useAssetsStore } from '@/stores/assets-store';
import { useMarketsStore } from '@/stores/markets-store';
import { useWalletStore } from '@/stores/wallets';
import { useNetwork } from '@/contexts/network/network-context';

export const Auth = () => {
  const { request } = useJsonRpcClient();
  const { chainId } = useNetwork();
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

  useEffect(() => {
    loadWallets(request);
  }, [request, loadWallets]);

  // TODO: Remove
  // HACK: This is work around to ensure that the wallets are loaded before network requests.
  // Ideally the backend should be capable of doing this in parallel, but increases perceived performance for now.
  useEffect(() => {
    if (!loadingWallets) {
      loadAssets(request, chainId);
      loadMarkets(request, chainId);
    }
  }, [chainId, loadAssets, loadMarkets, loadingWallets, request]);

  // Only render the UI if the wallets and networks have loaded
  if (loadingWallets) return null;

  return (
    <>
      <ModalWrapper />
      <div className="h-full w-full grid grid-rows-[1fr_min-content] bg-surface-0 text-surface-0-fg">
        <section className="w-full h-full overflow-y-auto">
          <div className="px-5 pt-3">
            <Outlet />
          </div>
        </section>
        <NavBar />
      </div>
    </>
  );
};
