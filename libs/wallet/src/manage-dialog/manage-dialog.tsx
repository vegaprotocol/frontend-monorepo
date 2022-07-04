import { t, truncateByChars } from '@vegaprotocol/react-helpers';
import {
  Button,
  Dialog,
  CopyWithTooltip,
  Intent,
  Icon,
} from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '..';

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
    <Dialog
      title={t('SELECT A VEGA KEY')}
      open={dialogOpen}
      onChange={setDialogOpen}
      intent={Intent.Primary}
    >
      <div className="text-ui">
        {keypairs ? (
          <ul className="mb-12" data-testid="keypair-list">
            {keypairs.map((kp) => {
              return (
                <li
                  key={kp.pub}
                  data-testid={`key-${kp.pub}`}
                  className="mb-24 last:mb-0"
                >
                  <h2 className="mb-8 text-h5 capitalize">{kp.name}</h2>
                  {kp.pub === keypair?.pub ? (
                    <p
                      className="uppercase mb-8 font-bold"
                      data-testid="selected-key"
                    >
                      {t('Selected key')}
                    </p>
                  ) : (
                    <Button
                      onClick={() => {
                        selectPublicKey(kp.pub);
                        setDialogOpen(false);
                      }}
                      disabled={kp.pub === keypair?.pub}
                      className="mb-8"
                      data-testid="select-keypair-button"
                    >
                      {t('Select this key')}
                    </Button>
                  )}
                  <div className="flex justify-between text-ui-small">
                    <p className="font-mono">
                      {truncateByChars(kp.pub, 23, 23)}
                    </p>
                    <CopyWithTooltip text={kp.pub}>
                      <button className="underline">
                        <Icon name="duplicate" className="mr-4" />
                        {t('Copy')}
                      </button>
                    </CopyWithTooltip>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : null}
        <div className="mt-24">
          <Button
            data-testid="disconnect"
            variant="secondary"
            onClick={() => {
              disconnect();
              setDialogOpen(false);
            }}
          >
            {t('Disconnect all keys')}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
