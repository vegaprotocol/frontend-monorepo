import type { Decimal } from '@vegaprotocol/rest';
import type BigNumber from 'bignumber.js';

export const Currency = ({
  value,
  symbol,
  formatDecimals,
}: {
  value: Decimal | BigNumber | undefined;
  symbol: string;
  formatDecimals?: number;
}) => {
  return (
    <span>
      {value?.toFormat(formatDecimals) || 0} {symbol}
    </span>
  );
};
