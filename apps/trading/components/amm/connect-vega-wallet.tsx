import { Check, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useConfig } from '@/lib/hooks/use-config';
import { useWallet } from '@/lib/hooks/use-wallet';
import { useVegaWalletDialogStore } from '@/lib/hooks/use-wallet-dialog-store';
import {
  type Connector,
  type ConnectorError,
  ConnectorErrors,
  type ConnectorType,
  type Status,
} from '@vegaprotocol/wallet';

export const ConnectVegaDialog = () => {
  const { open, setOpen } = useVegaWalletDialogStore();
  const { connectors, connect } = useConfig();
  const { status, error } = useWallet((store) => store);

  const handleConnect = async (id: ConnectorType) => {
    const result = await connect(id);

    if (result.status === 'connected') {
      setTimeout(() => setOpen(false), 1000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen} modal>
      <DialogContent>
        <ConnectContent
          connectors={connectors}
          status={status}
          error={error}
          onConnect={handleConnect}
        />
      </DialogContent>
    </Dialog>
  );
};

const ConnectContent = ({
  connectors,
  status,
  error,
  onConnect,
}: {
  connectors: Connector[];
  status: Status;
  error: ConnectorError | undefined;
  onConnect: (id: ConnectorType) => Promise<void>;
}) => {
  if (status === 'connected') {
    return (
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Check width={20} />
          Connected
        </DialogTitle>
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
        <DialogTitle>Connect Vega wallet</DialogTitle>
      </DialogHeader>
      {error && error.code !== ConnectorErrors.userRejected.code ? (
        <DialogDescription className="text-red-400 first-letter:uppercase">
          {error.message}
        </DialogDescription>
      ) : (
        <DialogDescription>
          Choose from the connection options below
        </DialogDescription>
      )}
      <ul className="flex flex-col gap-2">
        {connectors.map((c) => {
          return (
            <Button key={c.id} onClick={() => onConnect(c.id)}>
              {c.name}
            </Button>
          );
        })}
      </ul>
    </>
  );
};
