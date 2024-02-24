import { useMemo } from 'react';
import {
  InjectedConnector,
  JsonRpcConnector,
  SnapConnector,
  ViewPartyConnector,
  createConfig,
  fairground,
  stagnet,
  mainnet,
} from '@vegaprotocol/wallet';
import { useEnvironment } from '@vegaprotocol/environment';

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
      version: '0.3.1',
    });

    const readOnly = new ViewPartyConnector();

    const config = createConfig({
      chains: [mainnet, fairground, stagnet],
      defaultChainId: fairground.id,
      connectors: [injected, jsonRpc, snap, readOnly],
    });

    return config;
  }, [VEGA_ENV, VEGA_URL, VEGA_WALLET_URL]);
};
