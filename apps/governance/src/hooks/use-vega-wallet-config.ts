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
} from '@vegaprotocol/wallet';
import { CHAIN_IDS, useEnvironment } from '@vegaprotocol/environment';

export const useVegaWalletConfig = () => {
  const { VEGA_ENV, VEGA_URL, VEGA_WALLET_URL } = useEnvironment();
  return useMemo(() => {
    if (!VEGA_ENV || !VEGA_URL || !VEGA_WALLET_URL) return;

    const injected = new InjectedConnector();

    const jsonRpc = new JsonRpcConnector({
      url: VEGA_WALLET_URL,
    });

    const snap = new SnapConnector({
      node: new URL(VEGA_URL).origin,
      snapId: 'npm:@vegaprotocol/snap',
      version: '1.0.1',
    });

    const viewParty = new ViewPartyConnector();

    const config = createConfig({
      chains: [mainnet, fairground, validatorsTestnet, stagnet],
      defaultChainId: CHAIN_IDS[VEGA_ENV],
      connectors: [injected, snap, jsonRpc, viewParty],
    });

    return config;
  }, [VEGA_ENV, VEGA_URL, VEGA_WALLET_URL]);
};
