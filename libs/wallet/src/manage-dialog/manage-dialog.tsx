import { truncateByChars } from '@vegaprotocol/utils';
import {
  Button,
  Dialog,
  CopyWithTooltip,
  Intent,
  Icon,
} from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '../use-vega-wallet';
import { useT } from '../use-t';

export interface VegaManageDialogProps {
  dialogOpen: boolean;
  setDialogOpen: (isOpen: boolean) => void;
}

export const VegaManageDialog = ({
  dialogOpen,
  setDialogOpen,
}: VegaManageDialogProps) => {
  const t = useT();
  const { pubKey, pubKeys, selectPubKey, disconnect } = useVegaWallet();
  return (
    <Dialog
      title={t('SELECT A VEGA KEY')}
      open={dialogOpen}
      onChange={setDialogOpen}
      intent={Intent.Primary}
      size="small"
    >
      {pubKeys ? (
        <ul className="mb-4" data-testid="keypair-list">
          {pubKeys.map((pk) => {
            const isSelected = pk.publicKey === pubKey;
            return (
              <li
                key={pk.publicKey}
                data-testid={`key-${pk.publicKey}`}
                className="mb-2 last:mb-0"
              >
                <div
                  className="flex justify-between gap-4 text-sm"
                  data-testid={isSelected ? 'selected-key' : ''}
                >
                  <p data-testid="vega-public-key-full">
                    {truncateByChars(pk.publicKey)}
                  </p>
                  <div className="ml-auto flex gap-4">
                    {!isSelected && (
                      <button
                        onClick={() => {
                          selectPubKey(pk.publicKey);
                          setDialogOpen(false);
                        }}
                        disabled={isSelected}
                        data-testid="select-keypair-button"
                        className="underline"
                      >
                        {t('Select')}
                      </button>
                    )}
                    <CopyWithTooltip text={pk.publicKey}>
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
