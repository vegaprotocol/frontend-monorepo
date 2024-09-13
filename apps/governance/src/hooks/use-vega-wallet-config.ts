import { useMemo } from 'react';
import {
  InjectedConnector,
  JsonRpcConnector,
  SnapConnector,
  ViewPartyConnector,
  createConfig,
  nebula1,
} from '@vegaprotocol/wallet';
import { CHAIN_IDS, useEnvironment } from '@vegaprotocol/environment';

export const useVegaWalletConfig = () => {
  const { VEGA_ENV, API_NODE, VEGA_WALLET_URL } = useEnvironment();
  return useMemo(() => {
    if (!VEGA_ENV || !API_NODE || !VEGA_WALLET_URL) return;

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
      chains: [nebula1],
      defaultChainId: CHAIN_IDS[VEGA_ENV],
      connectors: [injected, snap, jsonRpc, viewParty],
    });

    return config;
  }, [API_NODE, VEGA_ENV, VEGA_WALLET_URL]);
};
