import { t } from '@vegaprotocol/react-helpers';
import type { ButtonVariant } from '@vegaprotocol/ui-toolkit';
import { Button } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet, useVegaWalletDialogStore } from '@vegaprotocol/wallet';

interface Props {
  disabled: boolean;
  variant: ButtonVariant;
}

export const DealTicketButton = ({ disabled, variant }: Props) => {
  const { pubKey } = useVegaWallet();
  const { openVegaWalletDialog } = useVegaWalletDialogStore((store) => ({
    openVegaWalletDialog: store.openVegaWalletDialog,
  }));
  return pubKey ? (
    <div className="mb-4">
      <Button
        variant={variant}
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
