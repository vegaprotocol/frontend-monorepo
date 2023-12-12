import { useFeatureFlags } from '@vegaprotocol/environment';
import { useMemo } from 'react';
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

export const snap = new SnapConnector(DEFAULT_SNAP_ID);

export const useConnectors = () => {
  const featureFlags = useFeatureFlags((state) => state.flags);
  return useMemo(
    () => ({
      injected,
      jsonRpc,
      view,
      snap: featureFlags.METAMASK_SNAPS ? snap : undefined,
    }),
    [featureFlags.METAMASK_SNAPS]
  );
};
