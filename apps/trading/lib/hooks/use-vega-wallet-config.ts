import {
  // InjectedConnector,
  // JsonRpcConnector,
  // SnapConnector,
  ViewPartyConnector,
  InBrowserConnector,
  createConfig,
  fairground,
  validatorsTestnet,
  mainnet,
  mirror,
  stagnet,
} from '@vegaprotocol/wallet';
import {
  CHAIN_IDS,
  useEnvironment,
  // useFeatureFlags,
} from '@vegaprotocol/environment';
import { useMemo } from 'react';

/**
 * Hook for memoizing the vega wallet config, since we can't be certain of the
 * node address for snap connection we need to re-new once its set or changes
 */
export const useVegaWalletConfig = () => {
  const { VEGA_ENV, API_NODE, VEGA_WALLET_URL } = useEnvironment();
  const { IN_BROWSER_WALLET } = useFeatureFlags((state) => state.flags);

  return useMemo(() => {
    if (!API_NODE || !VEGA_WALLET_URL) return;

    // const injected = new InjectedConnector();
    const inBrowser = new InBrowserConnector();

    // const jsonRpc = new JsonRpcConnector({
    //   url: VEGA_WALLET_URL,
    // });

    const snap = new SnapConnector({
      node: new URL(API_NODE.graphQLApiUrl).origin,
      snapId: 'npm:@vegaprotocol/snap',
      version: '1.0.1',
    });

    const viewParty = new ViewPartyConnector();

    const config = createConfig({
      chains: [mainnet, mirror, fairground, validatorsTestnet, stagnet],
      defaultChainId: CHAIN_IDS[VEGA_ENV],
      connectors: [inBrowser, viewParty],
    });

    return config;
  }, [IN_BROWSER_WALLET, VEGA_ENV, API_NODE, VEGA_WALLET_URL]);
};
