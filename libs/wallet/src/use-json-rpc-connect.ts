import { useCallback, useState } from 'react';
import type { JsonRpcConnector } from './connectors';
import { ClientErrors } from './connectors';
import { WalletError } from './connectors';
import { useVegaWallet } from './use-vega-wallet';

export enum Status {
  Idle = 'Idle',
  CheckingVersion = 'CheckingVersion',
  GettingChainId = 'GettingChainId',
  Connecting = 'Connecting',
  GettingPerms = 'GettingPerms',
  RequestingPerms = 'RequestingPerms',
  ListingKeys = 'ListingKeys',
  Connected = 'Connected',
  Error = 'Error',
}

export const useJsonRpcConnect = (onConnect: () => void) => {
  const { connect } = useVegaWallet();
  const [status, setStatus] = useState(Status.Idle);
  const [error, setError] = useState<WalletError | null>(null);

  const attemptConnect = useCallback(
    async (connector: JsonRpcConnector, appChainId: string) => {
      try {
        // Check that the running wallet is compatible with this connector
        setStatus(Status.CheckingVersion);
        await connector.checkCompat();

        // Check if wallet is configured for the same chain as the app
        setStatus(Status.GettingChainId);
        const chainIdResult = await connector.getChainId();

        if (chainIdResult.chainID !== appChainId && !('Cypress' in window)) {
          // Throw wallet error for consitent error handling
          throw ClientErrors.WRONG_NETWORK;
        }

        // Start connection flow. User will be prompted to select a wallet and enter
        // its password in the wallet application, promise will resolve once successful
        // or it will throw
        setStatus(Status.Connecting);
        await connector.connectWallet();

        // Check wallet is permitted to reveal its public keys
        setStatus(Status.GettingPerms);
        const permsResult = await connector.getPermissions();
        if (permsResult.permissions.public_keys === 'none') {
          // Automatically request new perms. User will again be prompted to permit this change
          // and enter their password
          setStatus(Status.RequestingPerms);
          await connector.requestPermissions();
        }

        // Call connect in the wallet provider. The connector will be stored for
        // future actions such as sending transactions
        await connect(connector);

        setStatus(Status.Connected);
        onConnect();
      } catch (err) {
        if (err instanceof WalletError) {
          setError(err);
        }
        setStatus(Status.Error);
      }
    },
    [onConnect, connect]
  );

  return {
    status,
    error,
    connect: attemptConnect,
  };
};
