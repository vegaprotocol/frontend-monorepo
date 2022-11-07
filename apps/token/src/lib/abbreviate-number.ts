import { getUserLocale } from '@vegaprotocol/react-helpers';
import type { BigNumber } from './bignumber';

export const getAbbreviatedNumber = (num: BigNumber) => {
  return Intl.NumberFormat(getUserLocale(), {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(num.toNumber());
};
