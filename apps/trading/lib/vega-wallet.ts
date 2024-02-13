import {
  InjectedConnector,
  JsonRpcConnector,
  SnapConnector,
  ReadOnlyConnector,
  createConfig,
  fairground,
  stagnet,
  getConfig,
} from '@vegaprotocol/wallet';

const walletCfg = getConfig();

const injected = new InjectedConnector();

const jsonRpc = new JsonRpcConnector({
  url: 'http://localhost:1789/api/v2/requests',
  token: walletCfg?.token,
});

const snap = new SnapConnector({
  node: 'https://api.n08.testnet.vega.rocks',
  snapId: 'npm:@vegaprotocol/snap',
  version: '0.3.1',
});
const readOnly = new ReadOnlyConnector(walletCfg?.pubKey);

export const config = createConfig({
  chains: [fairground, stagnet],
  defaultChainId: stagnet.id,
  connectors: [injected, jsonRpc, snap, readOnly],
});
