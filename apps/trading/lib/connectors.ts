import { InjectedConnector, RestConnector } from '@vegaprotocol/react-helpers';

export const injected = new InjectedConnector();
export const rest = new RestConnector();

export const Connectors = {
  injected,
  rest,
};
