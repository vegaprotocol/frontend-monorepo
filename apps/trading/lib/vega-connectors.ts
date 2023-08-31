import { FLAGS } from '@vegaprotocol/environment';
import {
  JsonRpcConnector,
  ViewConnector,
  InjectedConnector,
  SnapConnector,
  DEFAULT_SNAP_ID,
} from '@vegaprotocol/wallet';

export const jsonRpc = new JsonRpcConnector();
export const injected = new InjectedConnector();

let view: ViewConnector;
if (typeof window !== 'undefined') {
  const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
  view = new ViewConnector(urlParams.get('address'));
} else {
  view = new ViewConnector();
}

export const snap = FLAGS.METAMASK_SNAPS
  ? new SnapConnector(DEFAULT_SNAP_ID)
  : undefined;

export const Connectors = {
  injected,
  jsonRpc,
  view,
  snap,
};
