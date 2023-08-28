import { useCallback, useState } from 'react';
import {
  InjectedConnectorErrors,
  SnapConnector,
  SnapConnectorErrors,
} from './connectors';
import { InjectedConnector } from './connectors';
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
  const { connect, acknowledgeNeeded } = useVegaWallet();
  const [status, setStatus] = useState(Status.Idle);
  const [error, setError] = useState<Error | null>(null);
  const { VEGA_URL } = useEnvironment();

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
          if (!VEGA_URL) {
            throw SnapConnectorErrors.NODE_ADDRESS_NOT_SET;
          }
          connector.nodeAddress = new URL(VEGA_URL).origin;
        }

        setStatus(Status.GettingChainId);

        const { chainID } = await connector.getChainId();
        if (chainID !== appChainId) {
          throw InjectedConnectorErrors.INVALID_CHAIN;
        }

        setStatus(Status.Connecting);
        if (connector instanceof InjectedConnector) {
          // extra step for injected connector - authorize wallet
          await connector.connectWallet();
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
    [VEGA_URL, acknowledgeNeeded, connect, onConnect]
  );

  return {
    status,
    error,
    connect: attemptConnect,
  };
};
