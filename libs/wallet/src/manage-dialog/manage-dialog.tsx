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
      size="small"
    >
      {keypairs ? (
        <ul className="mb-4" data-testid="keypair-list">
          {keypairs.map((kp) => {
            return (
              <li
                key={kp.pub}
                data-testid={`key-${kp.pub}`}
                className="mb-2 last:mb-0"
              >
                <div className="flex gap-4 justify-between text-sm">
                  <p data-testid="vega-public-key-full">
                    {kp.name} {truncateByChars(kp.pub)}
                  </p>
                  <div className="flex gap-4 ml-auto">
                    <button
                      onClick={() => {
                        selectPublicKey(kp.pub);
                        setDialogOpen(false);
                      }}
                      disabled={kp.pub === keypair?.pub}
                      data-testid="select-keypair-button"
                      className="underline"
                    >
                      {t('Select')}
                    </button>
                    <CopyWithTooltip text={kp.pub}>
                      <button
                        data-testid="copy-vega-public-key"
                        className="underline"
                      >
                        {t('Copy')}
                        <Icon name="duplicate" className="ml-2" />
                      </button>
                    </CopyWithTooltip>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}
      <Button
        data-testid="disconnect"
        onClick={() => {
          disconnect();
          setDialogOpen(false);
        }}
        size="sm"
      >
        {t('Disconnect all keys')}
      </Button>
    </Dialog>
  );
};
