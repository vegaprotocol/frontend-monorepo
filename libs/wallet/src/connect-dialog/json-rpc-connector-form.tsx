import capitalize from 'lodash/capitalize';
import { t } from '@vegaprotocol/react-helpers';
import {
  ButtonLink,
  Cross,
  Diamond,
  Link,
  Loader,
  Tick,
} from '@vegaprotocol/ui-toolkit';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useState } from 'react';
import type { JsonRpcConnector } from '../connectors';
import { ClientErrors } from '../connectors';
import { useVegaWallet } from '../use-vega-wallet';
import { WalletError } from '../connectors';
import { ConnectDialogTitle } from './connect-dialog-elements';

enum Status {
  'idle',
  'checkingVersion',
  'gettingChainId',
  'connecting',
  'gettingPerms',
  'requestingPerms',
  'listingKeys',
  'connected',
  'error',
}

export const CLOSE_DELAY = 1700;
export const ServiceErrors = {
  NO_HEALTHY_NODE: 1000,
  CONNECTION_DECLINED: 3001,
};

export const JsonRpcConnectorForm = ({
  connector,
  onConnect,
  walletUrl,
  appChainId,
}: {
  connector: JsonRpcConnector;
  onConnect: () => void;
  walletUrl: string;
  appChainId: string;
}) => {
  const { connect } = useVegaWallet();
  const [status, setStatus] = useState(Status.idle);
  const [error, setError] = useState<WalletError | null>(null);

  const attemptConnect = useCallback(async () => {
    try {
      // Set the connector url in case a custo mone was selected
      connector.url = walletUrl;

      // Check that the running wallet is compatible with this connector
      setStatus(Status.checkingVersion);
      await connector.checkCompat();

      // Check if wallet is configured for the same chain as the app
      setStatus(Status.gettingChainId);
      const chainIdResult = await connector.getChainId();

      if (chainIdResult.chainID !== appChainId) {
        // Throw wallet error for consitent error handling
        throw new WalletError(
          'Wrong network',
          0,
          `To complete your wallet connection, set your wallet network in your app to "${appChainId}" then try again.`
        );
      }

      // Start connection flow. User will be prompted to select a wallet and enter
      // its password in the wallet application, promise will resolve once successful
      // or it will throw
      setStatus(Status.connecting);
      await connector.connectWallet();

      // Check wallet is permitted to reveal its public keys
      setStatus(Status.gettingPerms);
      const permsResult = await connector.getPermissions();
      if (permsResult.permissions.public_keys === 'none') {
        // Automatically request new perms. User will again be prompted to permit this change
        // and enter their password
        setStatus(Status.requestingPerms);
        await connector.requestPermissions();
      }

      // Call connect in the wallet provider. The connector will be stored for
      // future actions such as sending transactions
      await connect(connector);

      setStatus(Status.connected);

      // Briefly allow the success state to be shown then automatically
      // close the dialog
      setTimeout(() => {
        onConnect();
      }, CLOSE_DELAY);
    } catch (err) {
      if (err instanceof WalletError) {
        setError(err);
      }
      setStatus(Status.error);
    }
  }, [connector, connect, onConnect, walletUrl, appChainId]);

  useEffect(() => {
    if (status === Status.idle) {
      attemptConnect();
    }
  }, [status, attemptConnect]);

  if (status === Status.idle) {
    return null;
  }

  return (
    <Connecting
      status={status}
      error={error}
      connector={connector}
      appChainId={appChainId}
      reset={() => setStatus(Status.idle)}
    />
  );
};

const Connecting = ({
  status,
  error,
  connector,
  appChainId,
  reset,
}: {
  status: Status;
  error: WalletError | null;
  connector: JsonRpcConnector;
  appChainId: string;
  reset: () => void;
}) => {
  if (status === Status.error) {
    let title = t('Something went wrong');
    let text: ReactNode | undefined = t('An unknown error occurred');

    if (error) {
      if (error.code === ClientErrors.NO_SERVICE.code) {
        title = t('No wallet detected');
        text = t(`No wallet application running at ${connector.url}`);
      } else if (error.code === ServiceErrors.CONNECTION_DECLINED) {
        title = t('Connection declined');
        text = t('Your wallet connection was rejected');
      } else if (error.code === ServiceErrors.NO_HEALTHY_NODE) {
        title = error.message;
        text = (
          <>
            {capitalize(error.data)}
            {'. '}
            <Link href="https://docs.vega.xyz/docs/mainnet/concepts/vega-wallet">
              {t('Read the docs to troubleshoot')}
            </Link>
          </>
        );
      } else if (error.code === 0) {
        title = t('Wrong network');
        text = (
          <>
            {t(`To complete your wallet connection, set your wallet network in your
            app to ${appChainId} then `)}
            <ButtonLink onClick={reset}>{t('Try again')}</ButtonLink>
          </>
        );
      } else {
        title = error.message;
        text = `${error.data} (${error.code})`;
      }
    }

    return (
      <>
        <ConnectDialogTitle>{title}</ConnectDialogTitle>
        <p className="text-center">{text}</p>
      </>
    );
  }

  if (status === Status.checkingVersion) {
    return (
      <>
        <ConnectDialogTitle>{t('Checking wallet version')}</ConnectDialogTitle>
        <Center>
          <Loader />
        </Center>
        <p className="text-center">
          {t('Checking your wallet is compatible with this app')}
        </p>
      </>
    );
  }

  if (status === Status.gettingChainId) {
    return (
      <>
        <ConnectDialogTitle>{t('Verifying chain')}</ConnectDialogTitle>
        <Center>
          <Loader />
        </Center>
      </>
    );
  }

  if (status === Status.connected) {
    return (
      <>
        <ConnectDialogTitle>{t('Successfully connected')}</ConnectDialogTitle>
        <Center>
          <Tick />
        </Center>
      </>
    );
  }

  if (status === Status.connecting || status === Status.gettingPerms) {
    return (
      <>
        <ConnectDialogTitle>{t('Connecting...')}</ConnectDialogTitle>
        <Center>
          <Diamond />
        </Center>
        <p className="text-center">
          {t(
            "Approve the connection from your Vega wallet app. If you have multiple wallets you'll need to choose which to connect with."
          )}
        </p>
      </>
    );
  }

  if (status === Status.requestingPerms) {
    return (
      <>
        <ConnectDialogTitle>{t('Update permissions')}</ConnectDialogTitle>
        <Center>
          <Cross />
        </Center>
        <p className="text-center">
          {t(`${window.location.host} now has access to your Wallet, however you don't
        have sufficient permissions to retrieve your public keys. Approve the permissions update in your wallet.`)}
        </p>
      </>
    );
  }

  return null;
};

const Center = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex justify-center items-center my-6">{children}</div>
  );
};
