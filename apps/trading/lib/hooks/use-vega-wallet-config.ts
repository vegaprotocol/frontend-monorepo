import {
  InjectedConnector,
  JsonRpcConnector,
  ViewPartyConnector,
  QuickStartConnector,
  createConfig,
  fairground,
  validatorsTestnet,
  mainnet,
  mirror,
  stagnet,
  InBrowserConnector,
  SnapConnector,
} from '@vegaprotocol/wallet';
import { CHAIN_IDS, useEnvironment } from '@vegaprotocol/environment';
import { useMemo } from 'react';

/**
 * Hook for memoizing the vega wallet config, since we can't be certain of the
 * node address for snap connection we need to re-new once its set or changes
 */
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
    CONFIGURED_WALLETS,
    APP_NAME,
  } = useEnvironment();

  return useMemo(() => {
    const url = API_NODE?.graphQLApiUrl || API_NODE?.restApiUrl;
    if (!url || !VEGA_WALLET_URL || !APP_NAME) return;

    const injected = new InjectedConnector();
    const inBrowser = new InBrowserConnector();
    const quickStart = new QuickStartConnector();

    const jsonRpc = new JsonRpcConnector({
      url: VEGA_WALLET_URL,
    });

    const snap = new SnapConnector({
      node: new URL(API_NODE.graphQLApiUrl).origin,
      snapId: 'npm:@vegaprotocol/snap',
      version: '1.0.1',
    });

    const viewParty = new ViewPartyConnector();
    const filteredConnectors = [
      quickStart,
      injected,
      jsonRpc,
      viewParty,
      snap,
      inBrowser,
    ].filter((c) => CONFIGURED_WALLETS.includes(c.id));
    const config = createConfig({
      chains: [mainnet, mirror, fairground, validatorsTestnet, stagnet],
      defaultChainId: CHAIN_IDS[VEGA_ENV],
      connectors: filteredConnectors,
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
  }, [
    CONFIGURED_WALLETS,
    VEGA_ENV,
    API_NODE,
    VEGA_WALLET_URL,
    VEGA_EXPLORER_URL,
    VEGA_DOCS_URL,
    VEGA_TOKEN_URL,
    VEGA_CONSOLE_URL,
    ETHERSCAN_URL,
    APP_NAME,
  ]);
};
