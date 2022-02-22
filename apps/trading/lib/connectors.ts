import { InjectedConnector, RestConnector } from '@vegaprotocol/react-helpers';

export const Connectors = {
  injected: new InjectedConnector(),
  rest: new RestConnector(),
};
