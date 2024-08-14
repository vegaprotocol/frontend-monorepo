import { Check, Loader2 } from 'lucide-react';
import {
  type Config,
  type Connector,
  useAccount,
  useConnect,
  useDisconnect,
} from 'wagmi';
import type { ConnectMutate } from 'wagmi/query';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useEthWalletDialogStore } from '@/lib/hooks/use-wallet-dialog-store';

export const ConnectEthDialog = () => {
  const { open, setOpen } = useEthWalletDialogStore();
  const { connectors, connect: handleConnect, error } = useConnect();
  return (
    <Dialog open={open} onOpenChange={setOpen} modal>
      <DialogContent>
        <ConnectContent
          connectors={connectors}
          error={error}
          onConnect={handleConnect}
        />
      </DialogContent>
    </Dialog>
  );
};

const ConnectContent = ({
  connectors,
  error,
  onConnect,
}: {
  connectors: readonly Connector[];
  // biome-ignore lint/suspicious/noExplicitAny: ConnectErrorType is not exported by wagmi
  error: any | null;
  onConnect: ConnectMutate<Config, unknown>;
}) => {
  const { address, status } = useAccount();
  const { disconnect } = useDisconnect();

  if (status === 'connected') {
    return (
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Check width={20} />
          Connected
        </DialogTitle>
        <DialogDescription>{address}</DialogDescription>
        <Button onClick={() => disconnect()}>Disconnect</Button>
      </DialogHeader>
    );
  }

  if (status === 'connecting') {
    return (
      <>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Loader2 width={20} className="animate-spin" />
            Connecting
          </DialogTitle>
        </DialogHeader>
        <DialogDescription>Approve connection in wallet.</DialogDescription>
      </>
    );
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Connect Ethereum wallet</DialogTitle>
      </DialogHeader>
      {error ? (
        <DialogDescription className="text-red-400 first-letter:uppercase">
          <span>{status}</span>
          <span>{error?.message}</span>
        </DialogDescription>
      ) : (
        <DialogDescription>
          Choose from the connection options below
        </DialogDescription>
      )}
      <div className="flex flex-col gap-2">
        {connectors.map((connector) => (
          <Button
            key={connector.uid}
            onClick={() => onConnect({ connector })}
            type="button"
          >
            {connector.name}
          </Button>
        ))}
      </div>
    </>
  );
};
