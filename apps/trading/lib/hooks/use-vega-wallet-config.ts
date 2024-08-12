import {
  InjectedConnector,
  JsonRpcConnector,
  SnapConnector,
  ViewPartyConnector,
  createConfig,
  fairground,
  validatorsTestnet,
  mainnet,
  mirror,
  stagnet,
} from '@vegaprotocol/wallet';
import { CHAIN_IDS, useEnvironment } from '@vegaprotocol/environment';
import { useMemo } from 'react';

/**
 * Hook for memoizing the vega wallet config, since we can't be certain of the
 * node address for snap connection we need to re-new once its set or changes
 */
export const useVegaWalletConfig = () => {
  const { VEGA_ENV, API_NODE, VEGA_WALLET_URL } = useEnvironment();

  return useMemo(() => {
    if (!API_NODE || !VEGA_WALLET_URL) return;

    const injected = new InjectedConnector();

    const jsonRpc = new JsonRpcConnector({
      url: VEGA_WALLET_URL,
    });

    const snap = new SnapConnector({
      node: new URL(API_NODE.graphQLApiUrl).origin,
      snapId: 'npm:@vegaprotocol/snap',
      version: '1.0.1',
    });

    const viewParty = new ViewPartyConnector();

    const config = createConfig({
      chains: [mainnet, mirror, fairground, validatorsTestnet, stagnet],
      defaultChainId: CHAIN_IDS[VEGA_ENV],
      connectors: [injected, snap, jsonRpc, viewParty],
    });

    return config;
  }, [VEGA_ENV, API_NODE, VEGA_WALLET_URL]);
};
