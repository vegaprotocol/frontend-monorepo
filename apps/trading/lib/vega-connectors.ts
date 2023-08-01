import {
  RestConnector,
  JsonRpcConnector,
  ViewConnector,
  InjectedConnector,
  SnapConnector,
} from '@vegaprotocol/wallet';

export const rest = new RestConnector();
export const jsonRpc = new JsonRpcConnector();
export const injected = new InjectedConnector();
export const snap = new SnapConnector();

let view: ViewConnector;

if (typeof window !== 'undefined') {
  const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
  view = new ViewConnector(urlParams.get('address'));
} else {
  view = new ViewConnector();
}

export const Connectors = {
  injected,
  rest,
  jsonRpc,
  view,
  snap,
};
