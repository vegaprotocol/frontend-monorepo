import {
  JsonRpcConnector,
  ViewConnector,
  InjectedConnector,
} from '@vegaprotocol/wallet';

const urlParams = new URLSearchParams(window.location.search);

export const injected = new InjectedConnector();
export const jsonRpc = new JsonRpcConnector();
export const view = new ViewConnector(urlParams.get('address'));

export const Connectors = {
  injected,
  jsonRpc,
  view,
};
