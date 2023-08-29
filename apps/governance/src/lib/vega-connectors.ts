import { ENV } from '@vegaprotocol/environment';
import {
  JsonRpcConnector,
  ViewConnector,
  InjectedConnector,
  SnapConnector,
  DEFAULT_SNAP_ID,
} from '@vegaprotocol/wallet';

const urlParams = new URLSearchParams(window.location.search);

export const jsonRpc = new JsonRpcConnector();
export const injected = new InjectedConnector();
export const view = new ViewConnector(urlParams.get('address'));

export const snap = new SnapConnector(
  ENV.VEGA_URL ? new URL(ENV.VEGA_URL).origin : undefined,
  DEFAULT_SNAP_ID
);

export const Connectors = {
  injected,
  jsonRpc,
  view,
  snap,
};
