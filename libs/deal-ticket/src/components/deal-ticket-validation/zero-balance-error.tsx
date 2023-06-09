import { Intent, Notification, Link } from '@vegaprotocol/ui-toolkit';
import { useDepositDialog } from '@vegaprotocol/deposits';
import { t } from '@vegaprotocol/i18n';

interface ZeroBalanceErrorProps {
  asset: {
    id: string;
    symbol: string;
  };
  onClickCollateral?: () => void;
}

export const ZeroBalanceError = ({
  asset,
  onClickCollateral,
}: ZeroBalanceErrorProps) => {
  const openDepositDialog = useDepositDialog((state) => state.open);
  return (
    <Notification
      intent={Intent.Warning}
      testId="dealticket-error-message-zero-balance"
      message={
        <>
          {t(
            'You need %s in your wallet to trade in this market. ',
            asset.symbol
          )}
          {onClickCollateral && (
            <>
              {t('See all your')}{' '}
              <Link onClick={onClickCollateral}>collateral</Link>.
            </>
          )}
        </>
      }
      buttonProps={{
        text: t(`Make a deposit`),
        action: () => openDepositDialog(asset.id),
        dataTestId: 'deal-ticket-deposit-dialog-button',
        size: 'sm',
      }}
    />
  );
};
