import { Intent, Notification } from '@vegaprotocol/ui-toolkit';
import { useT } from '../../use-t';
import { getAssetSymbol, type AssetFieldsFragment } from '@vegaprotocol/assets';

interface NotEnoughErrorProps {
  asset: AssetFieldsFragment;
  onDeposit: (assetId: string) => void;
}

export const NotEnoughError = ({ asset, onDeposit }: NotEnoughErrorProps) => {
  const t = useT();

  return (
    <Notification
      intent={Intent.Warning}
      testId="deal-ticket-error-message-not-enough-balance"
      message={
        <>
          {t('You may not have enough {{symbol}} to make this trade.', {
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
