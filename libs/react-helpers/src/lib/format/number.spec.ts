import BigNumber from 'bignumber.js';
import { formatNumber, formatNumberPercentage, toNumberParts } from './number';

describe('formatNumber and formatNumberPercentage', () => {
  it.each([
    { v: new BigNumber(123), d: 3, o: '123.000' },
    { v: new BigNumber(123.123), d: 3, o: '123.123' },
    { v: new BigNumber(123.6666), d: 3, o: '123.667' },
    { v: new BigNumber(123.123), d: 6, o: '123.123000' },
    { v: new BigNumber(123.123), d: 0, o: '123' },
    { v: new BigNumber(123), d: undefined, o: '123' },
    { v: new BigNumber(30000), d: undefined, o: '30,000' },
    { v: new BigNumber(3.000001), d: undefined, o: '3' },
  ])('formats given number correctly', ({ v, d, o }) => {
    expect(formatNumber(v, d)).toStrictEqual(o);
  });

  it.each([
    { v: new BigNumber(123), d: 3, o: '123.000%' },
    { v: new BigNumber(123.123), d: 3, o: '123.123%' },
    { v: new BigNumber(123.123), d: 6, o: '123.123000%' },
    { v: new BigNumber(123.123), d: 0, o: '123%' },
    { v: new BigNumber(123), d: undefined, o: '123.00%' }, // it default to 2 decimal places
    { v: new BigNumber(30000), d: undefined, o: '30,000.00%' },
    { v: new BigNumber(3.000001), d: undefined, o: '3.000001%' },
  ])('formats given number correctly', ({ v, d, o }) => {
    expect(formatNumberPercentage(v, d)).toStrictEqual(o);
  });
});

describe('toNumberParts', () => {
  it.each([
    { v: null, d: 3, o: ['0', '000'] },
    { v: undefined, d: 3, o: ['0', '000'] },
    { v: new BigNumber(123), d: 3, o: ['123', '000'] },
    { v: new BigNumber(123.123), d: 3, o: ['123', '123'] },
    { v: new BigNumber(123.123), d: 6, o: ['123', '123000'] },
    { v: new BigNumber(123.123), d: 0, o: ['123', ''] },
    { v: new BigNumber(123), d: undefined, o: ['123', '000000000000000000'] },
    {
      v: new BigNumber(30000),
      d: undefined,
      o: ['30,000', '000000000000000000'],
    },
  ])('returns correct tuple given the different arguments', ({ v, d, o }) => {
    expect(toNumberParts(v, d)).toStrictEqual(o);
  });
});
