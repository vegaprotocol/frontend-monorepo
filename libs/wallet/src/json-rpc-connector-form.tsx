import { t } from '@vegaprotocol/react-helpers';
import { Icon, Loader } from '@vegaprotocol/ui-toolkit';
import { useCallback, useEffect, useState } from 'react';
import type { JsonRpcConnector } from './connectors';
import { useVegaWallet } from './use-vega-wallet';
import { WalletError } from './connectors';
import { ConnectDialogTitle } from './connect-dialog';

type Status =
  | 'idle'
  | 'gettingChainId'
  | 'connecting'
  | 'gettingPerms'
  | 'requestingPerms'
  | 'listingKeys'
  | 'connected'
  | 'error';

export const JsonRpcConnectorForm = ({
  connector,
  onConnect,
  walletUrl,
  appChainId,
}: {
  connector: JsonRpcConnector;
  onConnect: () => void;
  walletUrl: string;
  appChainId?: string;
}) => {
  const { connect } = useVegaWallet();
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<WalletError | null>(null);

  const attempConnect = useCallback(async () => {
    try {
      connector.url = walletUrl;
      setStatus('gettingChainId');

      // const chainIdResult = await connector.getChainId();

      // if (chainIdResult.chainID !== appChainId) {
      //   setError(
      //     `Invalid chain chain id: ${chainIdResult.chainID} does not match application chain id: ${appChainId}`
      //   );
      //   setStatus('error');
      //   return;
      // }

      setStatus('connecting');
      await connector.connectWallet();

      setStatus('gettingPerms');
      const permsResult = await connector.getPermissions();

      if (permsResult.permissions.public_keys === 'none') {
        setStatus('requestingPerms');
        await connector.requestPermissions();
      }

      await connect(connector);

      onConnect();
    } catch (err) {
      if (err instanceof WalletError) {
        setError(err);
      }
      setStatus('error');
    }
  }, [connector, connect, onConnect, walletUrl, appChainId]);

  useEffect(() => {
    if (status === 'idle') {
      attempConnect();
    }
  }, [status, attempConnect]);

  if (status === 'idle') {
    return null;
  }

  return <Connecting status={status} error={error} connector={connector} />;
};

const Connecting = ({
  status,
  error,
  connector,
}: {
  status: Status;
  error: WalletError | null;
  connector: JsonRpcConnector;
}) => {
  if (status === 'error') {
    let title = t('Something went wrong');
    let text: string | undefined = t('An unknown error occurred');
    const icon = null;

    if (error) {
      if (error.code === 3) {
        title = error.message;
        text = t(`No service running at ${connector.url}`);
      } else if (error.code === 3001) {
        title = t('Connection declined');
        text = t('Your wallet connect was rejected');
      } else {
        title = `${error.message} ${error.code}`;
        text = error.data;
      }
    }

    return (
      <>
        <ConnectDialogTitle>{title}</ConnectDialogTitle>
        {icon && (
          <div className="flex justify-center items-center my-6">
            <Icon name={icon} size={10} />
          </div>
        )}
        <p className="text-center">{text}</p>
      </>
    );
  }

  if (status === 'connected') {
    return (
      <>
        <ConnectDialogTitle>{t('Successfully connected')}</ConnectDialogTitle>
        <div className="flex justify-center items-center my-6">
          <Icon name="tick" size={10} />
        </div>
      </>
    );
  }

  if (status === 'connecting') {
    return (
      <>
        <ConnectDialogTitle>{t('Connecting...')}</ConnectDialogTitle>
        <div className="flex justify-center items-center my-6">
          <Icon name="exchange" size={10} />
        </div>
        <p className="text-center">
          {t(
            "Approve the connection from your Vega wallet app. If you have multiple wallets you'll need to choose which to connect with."
          )}
        </p>
      </>
    );
  }

  if (status === 'requestingPerms') {
    return (
      <>
        <ConnectDialogTitle>{t('Update permissions')}</ConnectDialogTitle>
        <div className="flex justify-center items-center my-6">
          <Icon name="shield" size={10} />
        </div>
        <p className="text-center">
          {t(`${window.location.host} now has access to your Wallet, however you don't
        have sufficient permissions to retrieve your public keys. Change your
        permissions in the wallet app`)}
        </p>
      </>
    );
  }

  if (status === 'gettingChainId') {
    return (
      <>
        <ConnectDialogTitle>{t('Verifying chain')}</ConnectDialogTitle>
        <div className="flex justify-center items-center my-6">
          <Loader size="small" />
        </div>
      </>
    );
  }

  return null;
};
