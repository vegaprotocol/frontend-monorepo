import { ENV } from '@vegaprotocol/environment';
import {
  JsonRpcConnector,
  ViewConnector,
  InjectedConnector,
  SnapConnector,
  DEFAULT_SNAP_ID,
} from '@vegaprotocol/wallet';

export const jsonRpc = new JsonRpcConnector();
export const injected = new InjectedConnector();

export const snap = new SnapConnector(
  ENV.VEGA_URL ? new URL(ENV.VEGA_URL).origin : undefined,
  DEFAULT_SNAP_ID
);

let view: ViewConnector;
if (typeof window !== 'undefined') {
  const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
  view = new ViewConnector(urlParams.get('address'));
} else {
  view = new ViewConnector();
}

export const Connectors = {
  injected,
  jsonRpc,
  view,
  snap,
};
