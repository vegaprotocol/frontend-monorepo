import { useMemo } from 'react';
import {
  InjectedConnector,
  JsonRpcConnector,
  SnapConnector,
  ViewPartyConnector,
  createConfig,
  fairground,
  validatorsTestnet,
  stagnet,
  mainnet,
  mirror,
} from '@vegaprotocol/wallet';
import { CHAIN_IDS, useEnvironment } from '@vegaprotocol/environment';

export const useVegaWalletConfig = () => {
  const { VEGA_ENV, API_NODE, VEGA_WALLET_URL, APP_NAME } = useEnvironment();
  return useMemo(() => {
    if (!VEGA_ENV || !API_NODE || !VEGA_WALLET_URL || !APP_NAME) return;

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
      appName: APP_NAME,
    });

    return config;
  }, [API_NODE, VEGA_ENV, VEGA_WALLET_URL]);
};
