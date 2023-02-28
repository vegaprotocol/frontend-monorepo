import type { BigNumber } from './bignumber';
import { formatNumber as format } from '@vegaprotocol/utils';

export const formatNumber = (value: BigNumber, decimals?: number) => {
  return format(
    value,
    typeof decimals === 'undefined' ? Math.max(value.dp() ?? 0, 2) : decimals
  );
};
