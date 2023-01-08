import {
  RestConnector,
  JsonRpcConnector,
  ViewConnector,
} from '@vegaprotocol/wallet';

export const rest = new RestConnector();
export const jsonRpc = new JsonRpcConnector();
export const view = new ViewConnector();

export const Connectors = {
  rest,
  jsonRpc,
  view,
};
