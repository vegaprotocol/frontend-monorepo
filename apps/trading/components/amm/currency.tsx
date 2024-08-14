import type { Asset } from '@/lib/queries/assets';
import type { Decimal } from '@/lib/utils';
import type BigNumber from 'bignumber.js';

export const Currency = ({
  value,
  asset,
  formatDecimals,
}: {
  value: Decimal | BigNumber | undefined;
  asset: Asset;
  formatDecimals?: number;
}) => {
  const format = Math.abs(formatDecimals || asset.decimals);

  return (
    <span>
      {value?.toFormat(format) || 0} <span>{asset.symbol}</span>
    </span>
  );
};
