import {
  InjectedConnector,
  JsonRpcConnector,
  SnapConnector,
  ReadOnlyConnector,
  createConfig,
  fairground,
  stagnet,
} from '@vegaprotocol/wallet';

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
  defaultChainId: fairground.id,
  connectors: [
    injected,
    jsonRpc,
    snap,
    // @ts-ignore getChainId only throws
    readOnly,
  ],
});
