import { Loader } from '@vegaprotocol/ui-toolkit';
import { useCallback, useEffect, useState } from 'react';
import type { JsonRpcConnector } from './connectors';
import { JsonRpcError } from './connectors';
import { useVegaWallet } from './use-vega-wallet';

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
  const [error, setError] = useState<string | null>(null);

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
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Something went wrong');
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

  return <Connecting status={status} error={error} />;
};

const Connecting = ({
  status,
  error,
}: {
  status: Status;
  error: string | null;
}) => {
  if (status === 'error') {
    return <p>{error ? error : 'Something went wrong'}</p>;
  }

  if (status === 'connected') {
    return <p>Success</p>;
  }

  if (status === 'connecting') {
    return (
      <p>
        Approve the connection from your Vega wallet app. If you have multiple
        wallets you'll need to choose which to connect with to complete the
        connection.
      </p>
    );
  }

  if (status === 'requestingPerms') {
    return (
      <p>
        {window.location.host} now has access to your Wallet, however you don't
        have sufficient permissions to retrieve your public keys. Change your
        permissions in the wallet app
      </p>
    );
  }

  if (status === 'gettingChainId') {
    return (
      <div className="flex items-center gap-4">
        <Loader size="small" /> Verifying chain
      </div>
    );
  }

  return <div>Shouldn't get here: {status}</div>;
};
