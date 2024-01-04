import { useCallback, useState } from 'react';
import {
  InjectedConnectorErrors,
  SnapConnector,
  SnapConnectorErrors,
} from './connectors';
import { InjectedConnector } from './connectors';
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
  const { vegaUrl, connect, acknowledgeNeeded } = useVegaWallet();
  const [status, setStatus] = useState(Status.Idle);
  const [error, setError] = useState<Error | null>(null);

  const attemptConnect = useCallback(
    async (
      connector: InjectedConnector | SnapConnector,
      appChainId: string
    ) => {
      try {
        if (connector instanceof InjectedConnector && !('vega' in window)) {
          throw InjectedConnectorErrors.VEGA_UNDEFINED;
        }
        if (connector instanceof SnapConnector) {
          if (!('ethereum' in window)) {
            throw SnapConnectorErrors.ETHEREUM_UNDEFINED;
          }
          if (!vegaUrl) {
            throw SnapConnectorErrors.NODE_ADDRESS_NOT_SET;
          }
          connector.nodeAddress = new URL(vegaUrl).origin;
        }

        setStatus(Status.GettingChainId);

        const { chainID } = await connector.getChainId();
        if (chainID !== appChainId) {
          throw InjectedConnectorErrors.INVALID_CHAIN;
        }

        setStatus(Status.Connecting);
        if (connector instanceof InjectedConnector) {
          // extra step for injected connector - authorize wallet
          await connector.connectWallet(appChainId);
        }
        await connect(connector); // connect with keys

        if (acknowledgeNeeded) {
          setStatus(Status.AcknowledgeNeeded);
        } else {
          setStatus(Status.Connected);
          onConnect();
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err);
        } else {
          setError(new Error('injected connection failed'));
        }
        setStatus(Status.Error);
      }
    },
    [vegaUrl, acknowledgeNeeded, connect, onConnect]
  );

  return {
    status,
    error,
    connect: attemptConnect,
  };
};
