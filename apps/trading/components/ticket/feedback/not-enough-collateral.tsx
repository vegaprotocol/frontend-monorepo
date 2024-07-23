import type BigNumber from 'bignumber.js';
import { Tooltip } from '@vegaprotocol/ui-toolkit';
import { type AssetFieldsFragment } from '@vegaprotocol/assets';
import { useT } from '../../../lib/use-t';
import { DepositButton } from './deposit-button';

export const NotEnoughCollateral = ({
  asset,
  availableCollateral,
  requiredCollateral,
}: {
  asset: AssetFieldsFragment;
  availableCollateral: BigNumber;
  requiredCollateral: BigNumber;
}) => {
  const t = useT();

  const description = (
    <div className="flex flex-col gap-1 p-2 text-xs">
      <p>
        {t('{{amount}} {{assetSymbol}} is currently required.', {
          amount: requiredCollateral.toString(),
          assetSymbol: asset.symbol,
        })}
      </p>
      <p>
        {t('You have only {{amount}}.', {
          amount: availableCollateral.toString(),
        })}
      </p>
    </div>
  );

  return (
    <p className="text-xs text-warning">
      <Tooltip description={description}>
        <span data-testid="feedback-not-enough-collateral">
          {t('You may not have enough margin available to open this position.')}
        </span>
      </Tooltip>{' '}
      <DepositButton asset={asset} />
    </p>
  );
};
