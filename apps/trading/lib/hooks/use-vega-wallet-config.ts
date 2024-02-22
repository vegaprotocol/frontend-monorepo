import {
  InjectedConnector,
  JsonRpcConnector,
  SnapConnector,
  ReadOnlyConnector,
  createConfig,
  fairground,
  stagnet,
} from '@vegaprotocol/wallet';
import { CHAIN_IDS, useEnvironment } from '@vegaprotocol/environment';
import { useMemo } from 'react';

/**
 * Hook for memoizing the vega wallet config, since we can't be certain of the
 * node address for snap connection we need to re-new once its set or changes
 */
export const useVegaWalletConfig = () => {
  const { VEGA_ENV, VEGA_URL, VEGA_WALLET_URL } = useEnvironment();

  return useMemo(() => {
    if (!VEGA_URL || !VEGA_WALLET_URL) return;

    const injected = new InjectedConnector();

    const jsonRpc = new JsonRpcConnector({
      url: VEGA_WALLET_URL,
    });

    const snap = new SnapConnector({
      node: new URL(VEGA_URL).origin,
      snapId: 'npm:@vegaprotocol/snap',
      version: '0.3.1',
    });

    const readOnly = new ReadOnlyConnector();

    const config = createConfig({
      chains: [fairground, stagnet],
      defaultChainId: CHAIN_IDS[VEGA_ENV],
      connectors: [
        injected,
        jsonRpc,
        snap,
        // TODO: fix types
        // @ts-ignore getChainId only throws
        readOnly,
      ],
    });

    return config;
  }, [VEGA_ENV, VEGA_URL, VEGA_WALLET_URL]);
};
