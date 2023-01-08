import {
  RestConnector,
  JsonRpcConnector,
  ViewConnector,
} from '@vegaprotocol/wallet';

const urlParams = new URLSearchParams(window.location.search);
console.log(urlParams.get('address'))

export const rest = new RestConnector();
export const jsonRpc = new JsonRpcConnector();
export const view = new ViewConnector(urlParams.get('address'));

export const Connectors = {
  rest,
  jsonRpc,
  view,
};
