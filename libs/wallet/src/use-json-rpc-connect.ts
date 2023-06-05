import { useCallback, useState } from 'react';
import { WalletClientError } from '@vegaprotocol/wallet-client';
import type { JsonRpcConnector } from './connectors';
import { ClientErrors } from './connectors';
import { useVegaWallet } from './use-vega-wallet';

export enum Status {
  Idle = 'Idle',
  CheckingVersion = 'CheckingVersion',
  GettingChainId = 'GettingChainId',
  Connecting = 'Connecting',
  GettingPerms = 'GettingPerms',
  Connected = 'Connected',
  Error = 'Error',
  AcknowledgeNeeded = 'AcknowledgeNeeded',
}

export const useJsonRpcConnect = (onConnect: () => void) => {
  const { connect, acknowledgeNeeded } = useVegaWallet();
  const [status, setStatus] = useState(Status.Idle);
  const [error, setError] = useState<WalletClientError | null>(null);

  const attemptConnect = useCallback(
    async (connector: JsonRpcConnector, appChainId: string) => {
      try {
        // Check that the running wallet is compatible with this connector
        setStatus(Status.CheckingVersion);
        await connector.checkCompat();

        // Check if wallet is configured for the same chain as the app
        setStatus(Status.GettingChainId);

        // Do not throw in when cypress is running as trading app relies on
        // mocks which result in a mismatch between chainId for app and
        // chainId for wallet
        if (!('Cypress' in window)) {
          const chainIdResult = await connector.getChainId();
          if (chainIdResult.chainID !== appChainId) {
            // Throw wallet error for consistent error handling
            throw ClientErrors.WRONG_NETWORK;
          }
        }

        // Start connection flow. User will be prompted to select a wallet and enter
        // its password in the wallet application, promise will resolve once successful
        // or it will throw
        setStatus(Status.Connecting);
        await connector.connectWallet();

        setStatus(Status.GettingPerms);

        // Call connect in the wallet provider. The connector will be stored for
        // future actions such as sending transactions
        await connect(connector);
        if (acknowledgeNeeded) {
          setStatus(Status.AcknowledgeNeeded);
        } else {
          setStatus(Status.Connected);
          onConnect();
        }
      } catch (err) {
        if (err instanceof WalletClientError) {
          setError(err);
        }
        setStatus(Status.Error);
      }
    },
    [onConnect, connect, acknowledgeNeeded]
  );

  return {
    status,
    error,
    connect: attemptConnect,
  };
};
