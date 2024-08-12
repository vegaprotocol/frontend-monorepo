import { MarginMode } from '@vegaprotocol/types';
import { MarginMode as MarginModeTx } from '@vegaprotocol/wallet';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { useT } from '../../lib/use-t';
import { Button, Dialog } from '@vegaprotocol/ui-toolkit';
import { MarginChange } from './margin-change';
import { NoWalletWarning } from './no-wallet-warning';

export const CrossDialog = ({
  open,
  onClose,
  marketId,
  create,
}: {
  open: boolean;
  onClose: () => void;
  marketId: string;
  create: (args: {
    updateMarginMode: {
      marketId: string;
      mode: MarginModeTx;
    };
  }) => void;
}) => {
  const { pubKey: partyId, isReadOnly } = useVegaWallet();
  const t = useT();
  return (
    <Dialog
      title={t('Cross margin')}
      size="small"
      open={open}
      onChange={(isOpen) => {
        if (!isOpen) {
          onClose();
        }
      }}
    >
      <div className="text-sm mb-4">
        <p className="mb-1">
          {t('You are setting this market to cross-margin mode.')}
        </p>
        <p className="mb-1">
          {t(
            'Your max leverage on each position will be determined by the risk model of the market.'
          )}
        </p>
        <p>
          {t(
            'All available funds in your general account will be used to finance your margin if the market moves against you.'
          )}
        </p>
      </div>
      <MarginChange
        marketId={marketId}
        partyId={partyId}
        marginMode={MarginMode.MARGIN_MODE_CROSS_MARGIN}
        marginFactor="1"
      />
      <NoWalletWarning noWalletConnected={!partyId} isReadOnly={isReadOnly} />
      <Button
        className="w-full"
        data-testid="confirm-cross-margin-mode"
        disabled={isReadOnly || !partyId}
        onClick={() => {
          if (isReadOnly) return;
          if (!partyId) return;
          create({
            updateMarginMode: {
              marketId,
              mode: MarginModeTx.MARGIN_MODE_CROSS_MARGIN,
            },
          });
          onClose();
        }}
      >
        {t('Confirm')}
      </Button>
    </Dialog>
  );
};
