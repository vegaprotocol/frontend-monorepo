import { useCallback, useState } from 'react';
import type { InjectedConnector } from './connectors';
import { useVegaWallet } from './use-vega-wallet';

export enum Status {
  Idle = 'Idle',
  GettingChainId = 'GettingChainId',
  Connecting = 'Connecting',
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
          setStatus(Status.Connected);
          onConnect();
        }
      } catch (err) {
        console.log(err);
        if (err instanceof Error) {
          setError(err);
        } else {
          setError(new Error('injected connection failed'));
        }
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
