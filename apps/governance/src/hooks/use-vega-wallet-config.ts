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
  const {
    VEGA_ENV,
    API_NODE,
    VEGA_WALLET_URL,
    VEGA_DOCS_URL,
    VEGA_EXPLORER_URL,
    VEGA_TOKEN_URL,
    VEGA_CONSOLE_URL,
    ETHERSCAN_URL,
    APP_NAME,
  } = useEnvironment();
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
      walletConfig: {
        explorer: VEGA_EXPLORER_URL ?? '',
        docs: VEGA_DOCS_URL ?? '',
        governance: VEGA_TOKEN_URL ?? '',
        console: VEGA_CONSOLE_URL ?? '',
        chainId: CHAIN_IDS[VEGA_ENV],
        etherscanUrl: ETHERSCAN_URL ?? '',
      },
      appName: APP_NAME,
    });

    return config;
  }, [APP_NAME, API_NODE, VEGA_ENV, VEGA_WALLET_URL]);
};
