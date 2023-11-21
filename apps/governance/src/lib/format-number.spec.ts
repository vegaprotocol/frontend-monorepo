import { BigNumber } from './bignumber';
import { formatNumber } from './format-number';

describe('formatNumber and formatNumberPercentage', () => {
  it.each([
    { v: new BigNumber(123), d: 3, o: '123.000' },
    { v: new BigNumber(123.123), d: 3, o: '123.123' },
    { v: new BigNumber(123.123), d: 6, o: '123.123000' },
    { v: new BigNumber(123.123), d: 0, o: '123' },
    { v: new BigNumber(123), d: undefined, o: '123.00' }, // it default to 2 decimal places
    { v: new BigNumber(30000), d: undefined, o: '30,000.00' },
    { v: new BigNumber(3.000001), d: undefined, o: '3.000001' },
  ])(`formatNumber($v, $d) -> $o`, ({ v, d, o }) => {
    expect(formatNumber(v, d)).toStrictEqual(o);
  });
});
