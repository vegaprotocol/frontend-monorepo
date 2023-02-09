import { Intent, Notification, Link } from '@vegaprotocol/ui-toolkit';
import { useDepositDialog } from '@vegaprotocol/deposits';
import { t } from '@vegaprotocol/react-helpers';
interface ZeroBalanceErrorProps {
  asset: {
    id: string;
    symbol: string;
  };
}

export const ZeroBalanceError = ({ asset }: ZeroBalanceErrorProps) => {
  const openDepositDialog = useDepositDialog((state) => state.open);
  return (
    <Notification
      intent={Intent.Warning}
      data-testid="dealticket-error-message-zero-balance"
      message={
        <>
          You need a {asset.symbol} in your wallet to trade in this market. See
          all your <Link>collateral</Link>.
        </>
      }
      buttonProps={{
        text: t(`Make a deposit`),
        action: () => openDepositDialog(asset.id),
        dataTestId: 'deal-ticket-deposit-dialog-button',
        size: 'md',
      }}
    />
  );
};
