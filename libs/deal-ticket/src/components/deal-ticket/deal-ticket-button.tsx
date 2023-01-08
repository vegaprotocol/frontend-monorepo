import { t } from '@vegaprotocol/react-helpers';
import type { ButtonVariant } from '@vegaprotocol/ui-toolkit';
import { Button } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet, useVegaWalletDialogStore } from '@vegaprotocol/wallet';

interface Props {
  transactionStatus: 'default' | 'pending';
  disabled: boolean;
  variant: ButtonVariant;
}

export const DealTicketButton = ({
  transactionStatus,
  disabled,
  variant,
}: Props) => {
  const { pubKey } = useVegaWallet();
  const { openVegaWalletDialog } = useVegaWalletDialogStore((store) => ({
    openVegaWalletDialog: store.openVegaWalletDialog,
  }));
  const isPending = transactionStatus === 'pending';
  return pubKey ? (
    <div className="mb-4">
      <Button
        variant={variant}
        fill
        type="submit"
        disabled={disabled || isPending}
        data-testid="place-order"
      >
        {isPending ? t('Pending...') : t('Place order')}
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
