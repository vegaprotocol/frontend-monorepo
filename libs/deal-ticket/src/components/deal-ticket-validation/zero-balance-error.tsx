import { Intent, Notification } from '@vegaprotocol/ui-toolkit';
import { useT } from '../../use-t';

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
  const t = useT();
  return (
    <Notification
      intent={Intent.Warning}
      testId="deal-ticket-error-message-zero-balance"
      message={
        <>
          {t(
            'You need {{symbol}} in your wallet to trade in this market. ',
            asset
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
