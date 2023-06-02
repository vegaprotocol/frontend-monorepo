import { useCallback, useState } from 'react';
import type { InjectedConnector } from './connectors';
import { useVegaWallet } from './use-vega-wallet';

export enum Status {
  Idle = 'Idle',
  CheckingVersion = 'CheckingVersion',
  GettingChainId = 'GettingChainId',
  Connecting = 'Connecting',
  GettingPerms = 'GettingPerms',
  ListingKeys = 'ListingKeys',
  Connected = 'Connected',
  Error = 'Error',
  AcknowledgeNeeded = 'AcknowledgeNeeded',
}

export const useInjectedConnector = (onConnect: () => void) => {
  const { connect, acknowledgeNeeded } = useVegaWallet();
  const [status, setStatus] = useState(Status.Idle);
  const [error, setError] = useState<Error | null>(null);

  const attemptConnect = useCallback(
    async (connector: InjectedConnector, appChainId: string) => {
      try {
        if (!('vega' in window)) {
          throw new Error('window.vega not found');
        }

        setStatus(Status.GettingChainId);

        const { chainID } = await connector.getChainId();

        if (chainID !== appChainId) {
          throw new Error('Invalid chain');
        }

        setStatus(Status.Connecting);
        await connector.connectWallet();

        await connect(connector);

        if (acknowledgeNeeded) {
          setStatus(Status.AcknowledgeNeeded);
        } else {
          console.log('here');
          setStatus(Status.Connected);
          onConnect();
        }
      } catch (err) {
        // @ts-ignore TODO: error typing needs handling
        setError(err);
        setStatus(Status.Error);
      }
    },
    [acknowledgeNeeded, connect, onConnect]
  );

  return {
    status,
    error,
    connect: attemptConnect,
  };
};
