import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Button } from '../ui/button';

export const ConnectEthWallet = () => {
  const account = useAccount();
  const { connectors, connect, status, error } = useConnect();
  const { disconnect } = useDisconnect();

  return (
    <>
      <div className="flex flex-col gap-2">
        <div>
          <span>Status: {account.status}</span>
          {account.status === 'connected' && (
            <div>
              <span>
                Addresses connected: {JSON.stringify(account.addresses)}
              </span>
              <span>ChainId: {account.chainId}</span>
            </div>
          )}
        </div>

        {account.status === 'connected' && (
          <Button type="button" onClick={() => disconnect()}>
            Disconnect
          </Button>
        )}
      </div>

      {account.status !== 'connected' && (
        <div className="flex flex-col gap-2">
          {connectors.map((connector) => (
            <Button
              key={connector.uid}
              onClick={() => connect({ connector })}
              type="button"
            >
              {connector.name}
            </Button>
          ))}
          <span>{status}</span>
          <span>{error?.message}</span>
        </div>
      )}
    </>
  );
};
