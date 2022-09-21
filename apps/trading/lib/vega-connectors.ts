import { RestConnector, JsonRpcConnector } from '@vegaprotocol/wallet';

export const rest = new RestConnector();
export const jsonRpc = new JsonRpcConnector();

export const Connectors = {
  rest,
  jsonRpc,
};
