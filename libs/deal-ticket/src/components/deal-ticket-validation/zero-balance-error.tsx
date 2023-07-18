import { Intent, Notification, Link } from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/i18n';

interface ZeroBalanceErrorProps {
  asset: {
    id: string;
    symbol: string;
  };
  onClickCollateral?: () => void;
  onDeposit: (assetId: string) => void;
}

export const ZeroBalanceError = ({
  asset,
  onClickCollateral,
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
        action: () => onDeposit(asset.id),
        dataTestId: 'deal-ticket-deposit-dialog-button',
        size: 'small',
      }}
    />
  );
};
