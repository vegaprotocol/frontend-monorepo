import {
  InjectedConnector,
  JsonRpcConnector,
  SnapConnector,
  createConfig,
  fairground,
  stagnet,
} from '@vegaprotocol/wallet';

export const injected = new InjectedConnector();
export const jsonRpc = new JsonRpcConnector({
  url: 'http://localhost:1789/api/v2/requests',
});
export const snap = new SnapConnector({
  node: 'https://api.n08.testnet.vega.rocks',
  id: 'npm:@vegaprotocol/snap',
  version: '0.3.1',
});

export const config = createConfig({
  chains: [fairground, stagnet],
  defaultChainId: stagnet.id,
  connectors: [injected, jsonRpc, snap],
});
