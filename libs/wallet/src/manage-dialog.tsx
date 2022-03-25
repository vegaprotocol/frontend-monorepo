import { truncateByChars } from '@vegaprotocol/react-helpers';
import { Button, Dialog } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '.';

export interface VegaManageDialogProps {
  dialogOpen: boolean;
  setDialogOpen: (isOpen: boolean) => void;
}

export const VegaManageDialog = ({
  dialogOpen,
  setDialogOpen,
}: VegaManageDialogProps) => {
  const { keypair, keypairs, selectPublicKey, disconnect } = useVegaWallet();
  return (
    <Dialog title="Vega wallet" open={dialogOpen} onChange={setDialogOpen}>
      <div className="text-ui">
        {keypairs ? (
          <ul className="mb-12" data-testid="keypair-list">
            {keypairs.map((kp) => (
              <li key={kp.pub} className="mb-8 last:mb-0">
                <button
                  data-testid={kp.pub}
                  onClick={() => {
                    selectPublicKey(kp.pub);
                    setDialogOpen(false);
                  }}
                  type="button"
                  className="underline"
                  disabled={kp.pub === keypair?.pub}
                >
                  {kp.name} {kp.pub === keypair?.pub ? '(Active)' : ''}
                </button>
                <p className="text-black-40 dark:text-white-40">
                  {truncateByChars(kp.pub, 20, 10)}
                </p>
              </li>
            ))}
          </ul>
        ) : null}
        <div>
          <Button
            data-testid="disconnect"
            onClick={() => {
              disconnect();
              setDialogOpen(false);
            }}
          >
            Disconnect
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
