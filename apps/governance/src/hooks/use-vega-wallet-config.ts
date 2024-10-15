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
  InBrowserConnector,
  QuickStartConnector,
} from '@vegaprotocol/wallet';
import { CHAIN_IDS, useEnvironment } from '@vegaprotocol/environment';
import { useWeb3ConnectStore } from '@vegaprotocol/web3';

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
  const { open } = useWeb3ConnectStore();
  return useMemo(() => {
    if (!VEGA_ENV || !API_NODE || !VEGA_WALLET_URL || !APP_NAME) return;

    const injected = new InjectedConnector();
    const quickStart = new InBrowserConnector();
    const inBrowser = new QuickStartConnector();
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
      web3ReactProps: { open },
    });

    return config;
  }, [
    open,
    API_NODE,
    VEGA_ENV,
    VEGA_WALLET_URL,
    VEGA_EXPLORER_URL,
    VEGA_DOCS_URL,
    VEGA_TOKEN_URL,
    VEGA_CONSOLE_URL,
    ETHERSCAN_URL,
    APP_NAME,
    CONFIGURED_WALLETS,
  ]);
};
