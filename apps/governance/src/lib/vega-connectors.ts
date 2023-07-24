import {
  RestConnector,
  JsonRpcConnector,
  ViewConnector,
  InjectedConnector,
} from '@vegaprotocol/wallet';

const urlParams = new URLSearchParams(window.location.search);

export const injected = new InjectedConnector();
export const rest = new RestConnector();
export const jsonRpc = new JsonRpcConnector();
export const view = new ViewConnector(urlParams.get('address'));

export const Connectors = {
  injected,
  rest,
  jsonRpc,
  view,
};
