import {
  InjectedConnector,
  JsonRpcConnector,
  ViewPartyConnector,
  // InBrowserConnector,
  QuickStartConnector,
  createConfig,
  nebula1,
} from '@vegaprotocol/wallet';
import { CHAIN_IDS, useEnvironment } from '@vegaprotocol/environment';
import { useMemo } from 'react';

/**
 * Hook for memoizing the vega wallet config, since we can't be certain of the
 * node address for snap connection we need to re-new once its set or changes
 */
export const useVegaWalletConfig = () => {
  const { VEGA_ENV, API_NODE, VEGA_WALLET_URL, CONFIGURED_WALLETS } =
    useEnvironment();

  return useMemo(() => {
    const url = API_NODE?.graphQLApiUrl || API_NODE?.restApiUrl;
    if (!url || !VEGA_WALLET_URL) return;

    const injected = new InjectedConnector();
    // const inBrowser = new InBrowserConnector();
    const quickStart = new QuickStartConnector();

    const jsonRpc = new JsonRpcConnector({
      url: VEGA_WALLET_URL,
    });

    const viewParty = new ViewPartyConnector();
    const filteredConnectors = [
      quickStart,
      injected,
      jsonRpc,
      viewParty,
    ].filter((c) => CONFIGURED_WALLETS.includes(c.id));
    const config = createConfig({
      chains: [nebula1],
      defaultChainId: CHAIN_IDS[VEGA_ENV],
      connectors: filteredConnectors,
    });

    return config;
  }, [CONFIGURED_WALLETS, VEGA_ENV, API_NODE, VEGA_WALLET_URL]);
};
