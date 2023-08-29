import type { InjectedConnector } from './injected-connector';
import type { JsonRpcConnector } from './json-rpc-connector';
import type { SnapConnector } from './snap-connector';
import type { ViewConnector } from './view-connector';

export * from './injected-connector';
export * from './json-rpc-connector';
export * from './snap-connector';
export * from './vega-connector';
export * from './view-connector';

export type Connectors = {
  jsonRpc: JsonRpcConnector | undefined;
  injected: InjectedConnector | undefined;
  snap: SnapConnector | undefined;
  view: ViewConnector | undefined;
};
