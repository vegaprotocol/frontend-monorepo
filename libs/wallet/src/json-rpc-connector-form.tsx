import { useEnvironment } from '@vegaprotocol/environment';
import { useCallback, useEffect, useState } from 'react';
import type { JsonRpcConnector } from './connectors';
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
}: {
  connector: JsonRpcConnector;
  onConnect: () => void;
  walletUrl: string;
}) => {
  const foo = useEnvironment();
  console.log(foo);
  const { connect } = useVegaWallet();
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<Error | null>(null);

  const attempConnect = useCallback(async () => {
    try {
      setStatus('gettingChainId');

      const result = await connector.getChainId(walletUrl);

      if (result.result.chainID !== appChainId) {
        handleError({
          message: 'Invalid chain',
          data: `chain id: ${result.result.chainID} does not match application chain id: ${appChainId}`,
        });
        return;
      }

      setStatus('connecting');
      const startConnect = await connector.connectWallet();

      if ('error' in startConnect) {
        handleError(startConnect.error);
        return;
      }

      setStatus('gettingPerms');
      const perms = await connector.getPermissions();

      if ('error' in perms) {
        handleError(perms.error);
        return;
      }

      if (perms.result.permissions.public_keys === 'none') {
        setStatus('requestingPerms');
        const reqPerms = await connector.requestPermissions();
        if ('error' in reqPerms) {
          handleError(reqPerms.error);
          return;
        }
      }

      await connect(connector);
      onConnect();
    } catch (err) {
      if (err instanceof Error) {
        setError(err);
      } else if (typeof err === 'string') {
        setError(new Error(err));
      } else {
        setError(new Error('Something went wrong'));
      }
      setStatus('error');
    }
  }, [connector, connect, onConnect, walletUrl]);

  const handleError = (error: {
    message: string;
    code?: number;
    data: string;
  }) => {
    setError(new Error(`${error.message} ${error.code}: ${error.data}`));
    setStatus('error');
  };

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
  error: Error | null;
}) => {
  if (status === 'error') {
    return <p>{error ? error.message : 'Something went wrong'}</p>;
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

  // if (status === 'gettingChain') {
  //   return (
  //     <div className="flex items-center gap-4">
  //       <Loader size="small" /> Verifying chain
  //     </div>
  //   );
  // }

  return <div>Shouldn't get here: {status}</div>;
};
