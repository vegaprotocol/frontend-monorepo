import { Intent, Notification } from '@vegaprotocol/ui-toolkit';
import { useT } from '../../use-t';
import { getAssetSymbol, type AssetFieldsFragment } from '@vegaprotocol/assets';

interface ZeroBalanceErrorProps {
  asset: AssetFieldsFragment;
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
          {t('You need {{symbol}} in your wallet to trade in this market.', {
            symbol: getAssetSymbol(asset),
          })}
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
