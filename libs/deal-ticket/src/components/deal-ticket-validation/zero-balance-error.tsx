import { Intent, Notification } from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/i18n';

interface ZeroBalanceErrorProps {
  asset: {
    id: string;
    symbol: string;
  };
  onDeposit: (assetId: string) => void;
}

export const ZeroBalanceError = ({
  asset,
  onDeposit,
}: ZeroBalanceErrorProps) => {
  return (
    <Notification
      intent={Intent.Warning}
      testId="deal-ticket-error-message-zero-balance"
      message={
        <>
          {t(
            'You need %s in your wallet to trade in this market. ',
            asset.symbol
          )}
        </>
      }
      buttonProps={{
        text: t(`Make a deposit`),
        action: () => {
          onDeposit(asset.id);
        },
        dataTestId: 'deal-ticket-deposit-dialog-button',
        size: 'small',
      }}
    />
  );
};
