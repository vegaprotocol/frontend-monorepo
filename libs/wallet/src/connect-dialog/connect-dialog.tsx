import { Button, Dialog, Loader } from '@vegaprotocol/ui-toolkit';
import { useState } from 'react';
import { t } from '@vegaprotocol/react-helpers';
import type { VegaConnector } from '../connectors';

export interface VegaConnectDialogProps {
  connectors: { [name: string]: VegaConnector };
  dialogOpen: boolean;
  setDialogOpen: (isOpen: boolean) => void;
}

const APP_CHAIN = 'testnet-e90e67';

type Status =
  | 'idle'
  | 'gettingChain'
  | 'connecting'
  | 'gettingPerms'
  | 'requestingPerms'
  | 'listingKeys'
  | 'connected'
  | 'error';

export function VegaConnectDialog({
  connectors,
  dialogOpen,
  setDialogOpen,
}: VegaConnectDialogProps) {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<Error | null>(null);
  const [keys, setKeys] = useState<string[]>([]);

  const handleError = (error: {
    message: string;
    code?: number;
    data: string;
  }) => {
    setError(new Error(`${error.message} ${error.code}: ${error.data}`));
    setStatus('error');
  };

  const connect = async () => {
    try {
      setStatus('gettingChain');

      const chainId = await request('session.get_chain_id', {});
      console.log(chainId);

      if (chainId.result.chainID !== APP_CHAIN) {
        handleError({
          message: 'Wrong chain',
          data: `App is configured to use ${APP_CHAIN} but wallet is using ${chainId.result.chainID}`,
        });
        return;
      }

      setStatus('connecting');
      const connect = await request('session.connect_wallet', {
        hostname: window.location.host,
      });

      if ('error' in connect) {
        handleError(connect.error);
        return;
      }

      setStatus('gettingPerms');
      const perms = await request('session.get_permissions', {
        token: connect.result.token,
      });

      if ('error' in perms) {
        handleError(perms.error);
        return;
      }

      if (perms.result.permissions.public_keys === 'none') {
        setStatus('requestingPerms');
        const reqPerms = await request('session.request_permissions', {
          token: connect.result.token,
          requestedPermissions: {
            public_keys: 'read',
          },
        });

        if ('error' in reqPerms) {
          handleError(reqPerms.error);
          return;
        }
      }

      setStatus('listingKeys');
      const keys = await request('session.list_keys', {
        token: connect.result.token,
      });

      if ('error' in keys) {
        handleError(perms.error);
        return;
      }

      setStatus('connected');
      setKeys(keys.result.keys);
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
  };

  return (
    <Dialog
      open={dialogOpen}
      size="small"
      onChange={(open) => {
        setStatus('idle');
        setError(null);
        setDialogOpen(open);
      }}
      title={
        status === 'idle'
          ? 'Connect to your Vega Wallet'
          : status === 'error'
          ? 'Something went wrong'
          : undefined
      }
    >
      {status === 'idle' ? (
        <Idle connect={connect} />
      ) : status === 'error' ? (
        <div>{error && error.message}</div>
      ) : (
        <Connecting status={status} keys={keys} />
      )}
    </Dialog>
  );
}

const Idle = ({ connect }: { connect: () => void }) => {
  return (
    <div>
      <div
        className="flex flex-col gap-12 justify-center items-stretch my-20 px-20"
        data-testid="connectors-list"
      >
        <Button
          // onClick={() => setSelectedConnector(connector)}
          onClick={connect}
        >
          {t('Connect via Vega wallet desktop app')}
        </Button>
        <Button
          // onClick={() => setSelectedConnector(connector)}
          onClick={connect}
        >
          {t('Connect with wallet CLI app')}
        </Button>
        <Button
          // onClick={() => setSelectedConnector(connector)}
          onClick={() => alert('TODO: Show hosted wallet form!')}
        >
          {t('Connect with hosted wallet')}
        </Button>
      </div>
      <p className="mb-8 text-center">
        <button className="underline" onClick={() => alert('TODO!')}>
          Enter custom wallet url
        </button>
      </p>
      <p className="text-center">
        <a href="https://google.com" className="underline">
          Dont have a wallet?
        </a>
      </p>
    </div>
  );
};

const Connecting = ({ status, keys }: { status: Status; keys: string[] }) => {
  if (status === 'connected') {
    return (
      <>
        <h3>Public keys</h3>
        <ul>
          {keys.map((key) => (
            <li key={key}>{key}</li>
          ))}
        </ul>
      </>
    );
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

  if (status === 'gettingChain') {
    return (
      <div className="flex items-center gap-12">
        <Loader size="small" /> Verifying chain
      </div>
    );
  }

  return <div>{status}</div>;
};

let id = 0;
function request(method: string, params: object) {
  return fetch('http://localhost:1789/api/v2/requests', {
    method: 'post',
    body: JSON.stringify({
      jsonrpc: '2.0',
      method,
      params,
      id: `${id++}`,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((res) => res.json());
}
