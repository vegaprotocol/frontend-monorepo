import type { BigNumber } from './bignumber';
import { formatNumber as format } from '@vegaprotocol/react-helpers';

export const formatNumber = (value: BigNumber, decimals?: number) => {
  console.log(
    typeof decimals === 'undefined' ? Math.max(value.dp() || 0, 2) : decimals
  );
  return format(
    value,
    typeof decimals === 'undefined' ? Math.max(value.dp() || 0, 2) : decimals
  );
};
