import { RestConnector, JsonRpcConnector } from '@vegaprotocol/wallet';

export const rest = new RestConnector();
export const jsonRpc = new JsonRpcConnector();

export const Connectors = [
  {
    type: 'gui',
    instance: rest,
  },
  {
    type: 'cli',
    instance: jsonRpc,
  },
  {
    type: 'hosted',
    instance: rest,
  },
];
