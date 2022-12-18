import { t } from '@vegaprotocol/react-helpers';
import { Button } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet, useVegaWalletDialogStore } from '@vegaprotocol/wallet';

interface Props {
  disabled: boolean;
}

export const DealTicketButton = ({ disabled }: Props) => {
  const { pubKey } = useVegaWallet();
  const { openVegaWalletDialog } = useVegaWalletDialogStore((store) => ({
    openVegaWalletDialog: store.openVegaWalletDialog,
  }));
  return pubKey ? (
    <div className="mb-4">
      <Button
        variant="primary"
        fill
        type="submit"
        disabled={disabled}
        data-testid="place-order"
      >
        {t('Place order')}
      </Button>
    </div>
  ) : (
    <Button
      variant="default"
      fill
      type="button"
      data-testid="order-connect-wallet"
      onClick={openVegaWalletDialog}
      className="mb-6"
    >
      {t('Connect wallet')}
    </Button>
  );
};
