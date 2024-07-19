import { type AssetFieldsFragment } from '@vegaprotocol/assets';
import { useT } from '../../../lib/use-t';
import { DepositButton } from './deposit-button';

export const NoCollateral = ({ asset }: { asset: AssetFieldsFragment }) => {
  const t = useT();
  return (
    <p data-testid="feedback-no-collateral" className="text-xs text-warning">
      {t('You need {{symbol}} in your wallet to trade in this market.', {
        symbol: asset.symbol,
      })}{' '}
      <DepositButton asset={asset} />
    </p>
  );
};
