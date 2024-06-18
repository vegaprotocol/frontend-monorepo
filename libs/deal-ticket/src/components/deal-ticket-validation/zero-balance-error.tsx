import { Intent, Notification } from '@vegaprotocol/ui-toolkit';
import { useT } from '../../use-t';
import { getAssetSymbol, type AssetFieldsFragment } from '@vegaprotocol/assets';

interface ZeroBalanceErrorProps {
  asset: AssetFieldsFragment;
  baseAsset?: AssetFieldsFragment;
  onDeposit: (assetId: string) => void;
}

export const ZeroBalanceError = ({
  asset,
  baseAsset,
  onDeposit,
}: ZeroBalanceErrorProps) => {
  const t = useT();

  return (
    <Notification
      intent={Intent.Warning}
      testId="deal-ticket-error-message-zero-balance"
      message={
        baseAsset ? (
          <>
            {t(
              'You need {{symbol1}} or {{symbol2}} in your wallet to trade in this market.',
              {
                symbol1: getAssetSymbol(asset),
                symbol2: getAssetSymbol(baseAsset),
              }
            )}
          </>
        ) : (
          <>
            {t('You need {{symbol}} in your wallet to trade in this market.', {
              symbol: getAssetSymbol(asset),
            })}
          </>
        )
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
