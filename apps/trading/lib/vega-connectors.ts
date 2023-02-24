import {
  RestConnector,
  JsonRpcConnector,
  ViewConnector,
  BrowserConnector,
} from '@vegaprotocol/wallet';

export const rest = new RestConnector();
export const jsonRpc = new JsonRpcConnector();
export const browser = new BrowserConnector();

let view: ViewConnector;
if (typeof window !== 'undefined') {
  const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
  view = new ViewConnector(urlParams.get('address'));
} else {
  view = new ViewConnector();
}

export const Connectors = {
  rest,
  jsonRpc,
  view,
  browser,
};
