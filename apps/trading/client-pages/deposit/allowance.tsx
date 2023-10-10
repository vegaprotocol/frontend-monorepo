import { t } from '@vegaprotocol/i18n';
import BigNumber from 'bignumber.js';

export const Allowance = ({ allowance }: { allowance: BigNumber }) => {
  let value = '';

  const format = (divisor: string) => {
    const result = allowance.dividedBy(divisor);
    return result.isInteger() ? result.toString() : result.toFixed(1);
  };

  if (allowance.isGreaterThan(new BigNumber('1e14'))) {
    value = t('>100t');
  } else if (allowance.isGreaterThanOrEqualTo(new BigNumber('1e12'))) {
    // Trillion
    value = `${format('1e12')}t`;
  } else if (allowance.isGreaterThanOrEqualTo(new BigNumber('1e9'))) {
    // Billion
    value = `${format('1e9')}b`;
  } else if (allowance.isGreaterThanOrEqualTo(new BigNumber('1e6'))) {
    // Million
    value = `${format('1e6')}m`;
  } else {
    value = allowance.toString();
  }

  return <span>{value}</span>;
};
