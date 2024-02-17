import {
  InjectedConnector,
  JsonRpcConnector,
  SnapConnector,
  ReadOnlyConnector,
  createConfig,
  fairground,
  stagnet,
} from '@vegaprotocol/wallet';
import { ENV, CHAIN_IDS } from '@vegaprotocol/environment';

const injected = new InjectedConnector();

const jsonRpc = new JsonRpcConnector({
  url: 'http://localhost:1789/api/v2/requests',
});

const snap = new SnapConnector({
  node: 'https://api.n08.testnet.vega.rocks',
  snapId: 'npm:@vegaprotocol/snap',
  version: '0.3.1',
});

const readOnly = new ReadOnlyConnector();

export const config = createConfig({
  chains: [fairground, stagnet],
  defaultChainId: CHAIN_IDS[ENV.VEGA_ENV],
  connectors: [injected, jsonRpc, snap, readOnly],
});
