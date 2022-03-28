import { truncateByChars } from '@vegaprotocol/react-helpers';
import { Button, Dialog, CopyWithTooltip } from '@vegaprotocol/ui-toolkit';
import classNames from 'classnames';
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
            {keypairs.map((kp) => {
              const buttonClasses = classNames('underline', {
                'text-vega-pink dark:text-vega-yellow': kp.pub === keypair?.pub,
              });
              return (
                <li
                  key={kp.pub}
                  data-testid={`key-${kp.pub}`}
                  className="mb-8 last:mb-0"
                >
                  <button
                    onClick={() => {
                      selectPublicKey(kp.pub);
                      setDialogOpen(false);
                    }}
                    type="button"
                    className={buttonClasses}
                    disabled={kp.pub === keypair?.pub}
                  >
                    {kp.name} {kp.pub === keypair?.pub ? '(Active)' : ''}
                  </button>
                  <div className="flex justify-between">
                    <p className="text-black-40 dark:text-white-40 font-mono">
                      {truncateByChars(kp.pub, 23, 23)}
                    </p>
                    <CopyWithTooltip text={kp.pub}>
                      <button className="underline">Copy</button>
                    </CopyWithTooltip>
                  </div>
                </li>
              );
            })}
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
