import { useVegaWallet, useVegaWalletDialogStore } from '@vegaprotocol/wallet';
import { Button } from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/react-helpers';
import type { DealTicketErrorMessage } from './deal-ticket-error';
import { DealTicketError } from './deal-ticket-error';
import { DEAL_TICKET_SECTION } from '../constants';

interface Props {
  transactionStatus: 'default' | 'pending';
  isDisabled: boolean;
  errorMessage?: DealTicketErrorMessage;
}

export const DealTicketButton = ({
  transactionStatus,
  errorMessage,
  isDisabled,
}: Props) => {
  const { pubKey } = useVegaWallet();
  const { openVegaWalletDialog } = useVegaWalletDialogStore((store) => ({
    openVegaWalletDialog: store.openVegaWalletDialog,
  }));
  return pubKey ? (
    <div className="mb-6">
      <Button
        variant="primary"
        fill
        type="submit"
        disabled={isDisabled}
        data-testid="place-order"
      >
        {transactionStatus === 'pending' ? t('Pending...') : t('Place order')}
      </Button>
      <DealTicketError
        errorMessage={errorMessage}
        data-testid="dealticket-error-message"
        section={DEAL_TICKET_SECTION.SUMMARY}
      />
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
