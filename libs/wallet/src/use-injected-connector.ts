import { useCallback, useState } from 'react';
import { InjectedConnector, SnapConnector } from './connectors';
import { useVegaWallet } from './use-vega-wallet';
import { useEnvironment } from '@vegaprotocol/environment';

export enum Status {
  Idle = 'Idle',
  GettingChainId = 'GettingChainId',
  Connecting = 'Connecting',
  Connected = 'Connected',
  Error = 'Error',
  AcknowledgeNeeded = 'AcknowledgeNeeded',
}

export const useInjectedConnector = (onConnect: () => void) => {
  const { VEGA_URL } = useEnvironment();
  const { connect, acknowledgeNeeded } = useVegaWallet();
  const [status, setStatus] = useState(Status.Idle);
  const [error, setError] = useState<Error | null>(null);

  const attemptConnect = useCallback(
    async (
      connector: InjectedConnector | SnapConnector,
      appChainId: string
    ) => {
      try {
        if (connector instanceof InjectedConnector && !('vega' in window)) {
          throw new Error('window.vega not found');
        }

        if (connector instanceof SnapConnector) {
          if (!('ethereum' in window)) {
            throw new Error('window.ethereum not found');
          }
          if (!VEGA_URL) {
            throw new Error('no connected node');
          }

          connector.nodeAddress = new URL(VEGA_URL).origin;
        }

        setStatus(Status.GettingChainId);

        // const { chainID } = await connector.getChainId();

        // if (chainID !== appChainId) {
        //   throw new Error('Invalid chain');
        // }

        setStatus(Status.Connecting);
        await connector.connectWallet(); // authorize wallet
        await connect(connector); // connect with keys

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
    [acknowledgeNeeded, connect, onConnect, VEGA_URL]
  );

  return {
    status,
    error,
    connect: attemptConnect,
  };
};
