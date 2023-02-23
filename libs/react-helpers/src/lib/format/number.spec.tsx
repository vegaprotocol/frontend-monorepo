import BigNumber from 'bignumber.js';

import {
  addDecimalsFormatNumber,
  compactNumber,
  formatNumber,
  formatNumberPercentage,
  isNumeric,
  toDecimal,
  toNumberParts,
} from './number';

describe('number react-helpers', () => {
  it.each([
    { v: new BigNumber(123000), d: 5, o: '1.23' },
    { v: new BigNumber(123000), d: 3, o: '123.00' },
    { v: new BigNumber(123000), d: 1, o: '12,300.0' },
    { v: new BigNumber(123001), d: 2, o: '1,230.01' },
    { v: new BigNumber(123001000), d: 2, o: '1,230,010.00' },
  ])(
    'formats with addDecimalsFormatNumber given number correctly',
    ({ v, d, o }) => {
      expect(addDecimalsFormatNumber(v.toString(), d)).toStrictEqual(o);
    }
  );

  it.each([
    { v: new BigNumber(123), d: 3, o: '123.00' },
    { v: new BigNumber(123.123), d: 3, o: '123.123' },
    { v: new BigNumber(123.6666), d: 3, o: '123.667' },
    { v: new BigNumber(123.123), d: 6, o: '123.123' },
    { v: new BigNumber(123.123), d: 0, o: '123' },
    { v: new BigNumber(123), d: undefined, o: '123' },
    { v: new BigNumber(30000), d: undefined, o: '30,000' },
    { v: new BigNumber(3.000001), d: undefined, o: '3' },
  ])('formats with formatNumber given number correctly', ({ v, d, o }) => {
    expect(formatNumber(v, d)).toStrictEqual(o);
  });

  it.each([
    { v: new BigNumber(123), d: 3, o: '123.00%' },
    { v: new BigNumber(123.123), d: 3, o: '123.123%' },
    { v: new BigNumber(123.123), d: 6, o: '123.123%' },
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
    { v: new BigNumber(123), d: 3, o: ['123', '00'] },
    { v: new BigNumber(123.123), d: 3, o: ['123', '123'] },
    { v: new BigNumber(123.123), d: 6, o: ['123', '123'] },
    { v: new BigNumber(123.123), d: 0, o: ['123', ''] },
    { v: new BigNumber(123), d: undefined, o: ['123', '00'] },
    {
      v: new BigNumber(30000),
      d: undefined,
      o: ['30,000', '00'],
    },
  ])('returns correct tuple given the different arguments', ({ v, d, o }) => {
    expect(toNumberParts(v, d)).toStrictEqual(o);
  });
});

describe('isNumeric', () => {
  it.each([
    { i: null, o: false },
    { i: undefined, o: false },
    { i: 1, o: true },
    { i: '1', o: true },
    { i: '-1', o: true },
    { i: 0.1, o: true },
    { i: '.1', o: true },
    { i: '-.1', o: true },
    { i: 123, o: true },
    { i: -123, o: true },
    { i: '123', o: true },
    { i: '123.01', o: true },
    { i: '-123.01', o: true },
    { i: '--123.01', o: false },
    { i: '123.', o: false },
    { i: '123.1.1', o: false },
    { i: BigInt(123), o: true },
    { i: BigInt(-1), o: true },
    { i: new BigNumber(123), o: true },
    { i: new BigNumber(123.123), o: true },
    { i: new BigNumber(123.123).toString(), o: true },
    { i: new BigNumber(123), o: true },
    { i: Infinity, o: false },
    { i: NaN, o: false },
  ])(
    'returns correct results',
    ({
      i,
      o,
    }: {
      i: number | string | undefined | null | BigNumber | bigint;
      o: boolean;
    }) => {
      expect(isNumeric(i)).toStrictEqual(o);
    }
  );
});

describe('compactNumber', () => {
  const short: [BigNumber, string | JSX.Element, number | 'infer'][] = [
    [new BigNumber(Infinity), '∞', 'infer'],
    [new BigNumber(-Infinity), '-∞', 'infer'],
    [new BigNumber(0), '0', 'infer'],
    [new BigNumber(1), '1', 'infer'],
    [new BigNumber(100), '100', 'infer'],
    [new BigNumber(100.456601), '100.456601', 'infer'],
    [new BigNumber(1_000), '1,000', 'infer'],
    [new BigNumber(999_999), '999,999', 'infer'],
    [new BigNumber(1_000_000), '1M', 'infer'],
    [new BigNumber(100_000_000), '100M', 'infer'],
    [new BigNumber(1_000_000_000), '1B', 'infer'],
    [new BigNumber(1_000_000_000_000), '1T', 'infer'],
    [new BigNumber(3.23e12), '3.23T', 2],
    [new BigNumber(3.23e12), '3.23000T', 5],
    [
      new BigNumber(3.23e24),
      <span>
        3.23000{' '}
        <span>
          &times; 10<sup>24</sup>
        </span>
      </span>,
      5,
    ],
    [
      new BigNumber(1.579208923731619e59),
      <span>
        1.57921{' '}
        <span>
          &times; 10
          <sup>59</sup>
        </span>
      </span>,
      5,
    ],
  ];
  it.each(short)(
    'compacts %d to %p (decimal places: %p)',
    (input, output, decimals) => {
      expect(compactNumber(input, decimals)).toEqual(output);
    }
  );

  const long: [BigNumber, string | JSX.Element, number | 'infer'][] = [
    [new BigNumber(Infinity), '∞', 'infer'],
    [new BigNumber(-Infinity), '-∞', 'infer'],
    [new BigNumber(0), '0', 'infer'],
    [new BigNumber(1), '1', 'infer'],
    [new BigNumber(100), '100', 'infer'],
    [new BigNumber(100.456601), '100.456601', 'infer'],
    [new BigNumber(1_000), '1,000', 'infer'],
    [new BigNumber(999_999), '999,999', 'infer'],
    [new BigNumber(1_000_000), '1 million', 'infer'],
    [new BigNumber(100_000_000), '100 million', 'infer'],
    [new BigNumber(1_000_000_000), '1 billion', 'infer'],
    [new BigNumber(1_000_000_000_000), '1 trillion', 'infer'],
    [new BigNumber(3.23e12), '3.23 trillion', 2],
    [new BigNumber(3.23e12), '3.23000 trillion', 5],
    [
      new BigNumber(3.23e24),
      <span>
        3.23000{' '}
        <span>
          &times; 10<sup>24</sup>
        </span>
      </span>,
      5,
    ],
    [
      new BigNumber(1.579208923731619e59),
      <span>
        1.57921{' '}
        <span>
          &times; 10
          <sup>59</sup>
        </span>
      </span>,
      5,
    ],
  ];
  it.each(long)(
    'compacts %d to %p (decimal places: %p)',
    (input, output, decimals) => {
      expect(compactNumber(input, decimals, 'long')).toEqual(output);
    }
  );
});

describe('toDecimal', () => {
  it.each([
    { v: 7, o: '0.0000001' },
    { v: 8, o: '0.00000001' },
    { v: 0, o: '0' },
  ])('formats with toNumber given number correctly', ({ v, o }) => {
    expect(toDecimal(v)).toStrictEqual(o);
  });
});
