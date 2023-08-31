import { FLAGS } from '@vegaprotocol/environment';
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

export const snap = FLAGS.METAMASK_SNAPS
  ? new SnapConnector(DEFAULT_SNAP_ID)
  : undefined;

export const Connectors = {
  injected,
  jsonRpc,
  view,
  snap,
};
