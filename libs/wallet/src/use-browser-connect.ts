import { useCallback, useState } from 'react';
import { WalletClientError } from '@vegaprotocol/wallet-client';
import type { BrowserConnector } from './connectors';
import { ClientErrors } from './connectors';
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
}

export const useBrowserConnect = (onConnect: () => void) => {
  const { connect } = useVegaWallet();
  const [status, setStatus] = useState(Status.Idle);
  const [error, setError] = useState<WalletClientError | null>(null);

  const attemptConnect = useCallback(
    async (connector: BrowserConnector, appChainId: string) => {
      try {
        connector.initialize();
        // Check that the running wallet is compatible with this connector
        setStatus(Status.CheckingVersion);
        await connector.checkCompat();

        // Check if wallet is configured for the same chain as the app
        setStatus(Status.GettingChainId);

        // Dont throw in when cypress is running as trading app relies on
        // mocks which result in a mismatch between chainId for app and
        // chainId for wallet
        if (!('Cypress' in window)) {
          const chainIdResult = await connector.getChainId();
          console.log('CHAIN RES: ', chainIdResult);
          if (chainIdResult.chainID !== appChainId) {
            // Throw wallet error for consitent error handling
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

        setStatus(Status.Connected);
        onConnect();
      } catch (err) {
        console.log('ERROR!!!!!', err);
        if (err instanceof WalletClientError) {
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
