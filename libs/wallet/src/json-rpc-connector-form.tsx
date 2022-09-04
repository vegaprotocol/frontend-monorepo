import { Button } from '@vegaprotocol/ui-toolkit';
import { useState } from 'react';
import type { JsonRpcConnector } from './connectors';

type Status =
  | 'idle'
  | 'connecting'
  | 'gettingPerms'
  | 'requestingPerms'
  | 'listingKeys'
  | 'connected'
  | 'error';

export const JsonRpcConnectorForm = ({
  connector,
  onConnect,
}: {
  connector: JsonRpcConnector;
  onConnect: (connector: JsonRpcConnector) => void;
}) => {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<Error | null>(null);

  const connect = async () => {
    try {
      setStatus('connecting');

      const connect = await connector.startSession();

      if ('error' in connect) {
        handleError(connect.error);
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

      onConnect(connector);
    } catch (err) {
      console.log(err);
      if (err instanceof Error) {
        setError(err);
      } else if (typeof err === 'string') {
        setError(new Error(err));
      } else {
        setError(new Error('Something went wrong'));
      }
      setStatus('error');
    }
  };

  const handleError = (error: {
    message: string;
    code?: number;
    data: string;
  }) => {
    setError(new Error(`${error.message} ${error.code}: ${error.data}`));
    setStatus('error');
  };

  if (status === 'idle') {
    return (
      <Button variant="primary" onClick={connect}>
        Start
      </Button>
    );
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
