import BigNumber from 'bignumber.js';

import {
  addDecimalsFormatNumber,
  addDecimalsFormatNumberQuantum,
  formatNumber,
  formatNumberPercentage,
  getUnlimitedThreshold,
  isNumeric,
  removeDecimal,
  toBigNum,
  quantumDecimalPlaces,
  toDecimal,
  toNumberParts,
  formatNumberRounded,
  toQUSD,
} from './number';

describe('number utils', () => {
  it.each([
    { v: new BigNumber(123000), d: 5, o: '1.23' },
    { v: new BigNumber(123000), d: 3, o: '123.00' },
    { v: new BigNumber(123000), d: 1, o: '12,300.0' },
    { v: new BigNumber(123001), d: 2, o: '1,230.01' },
    { v: new BigNumber(123001000), d: 2, o: '1,230,010.00' },
    { v: '100000000000000000001', d: 18, o: '100.000000000000000001' },
  ])(
    'formats with addDecimalsFormatNumber given number correctly',
    ({ v, d, o }) => {
      expect(addDecimalsFormatNumber(v.toString(), d)).toStrictEqual(o);
    }
  );

  it.each([
    { v: '1234000000000000000', d: 18, q: '1000000000000000000', o: '1.23' }, //vega
    { v: '1235000000000000000', d: 18, q: '1000000000000000000', o: '1.24' }, //vega
    { v: '1230012', d: 6, q: '1000000', o: '1.23' }, // USDT
    { v: '1234560000000000000', d: 18, q: '500000000000000', o: '1.2346' }, // WEth
    { v: '87355895794255', d: 18, q: '5000000000000000', o: '0.00009' },
  ])(
    'formats with addDecimalsFormatNumberQuantum given number correctly',
    ({ v, d, o, q }) => {
      expect(addDecimalsFormatNumberQuantum(v.toString(), d, q)).toStrictEqual(
        o
      );
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
    { v: new BigNumber(123), d: undefined, o: '123%' }, // it default to 2 decimal places
    { v: new BigNumber(30000), d: undefined, o: '30,000%' },
    { v: new BigNumber(3.000001), d: undefined, o: '3.000001%' },
  ])('formats given number correctly', ({ v, d, o }) => {
    expect(formatNumberPercentage(v, d)).toStrictEqual(o);
  });

  it('formatNumberPercentage returns "-" when value is null', () => {
    expect(formatNumberPercentage(null)).toStrictEqual('-');
  });

  it('formatNumberPercentage returns "-" when value is undefined', () => {
    expect(formatNumberPercentage(undefined)).toStrictEqual('-');
  });

  describe('toNumberParts', () => {
    it.each([
      { v: null, d: 3, o: ['0', '000', '.'] },
      { v: undefined, d: 3, o: ['0', '000', '.'] },
      { v: new BigNumber(123), d: 3, o: ['123', '00', '.'] },
      { v: new BigNumber(123.123), d: 3, o: ['123', '123', '.'] },
      { v: new BigNumber(123.123), d: 6, o: ['123', '123', '.'] },
      { v: new BigNumber(123.123), d: 0, o: ['123', '', '.'] },
      { v: new BigNumber(123), d: undefined, o: ['123', '00', '.'] },
      {
        v: new BigNumber(30000),
        d: undefined,
        o: ['30,000', '00', '.'],
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

  describe('toDecimal', () => {
    it.each([
      { v: 0, o: '1' },
      { v: 1, o: '0.1' },
      { v: 2, o: '0.01' },
      { v: 3, o: '0.001' },
      { v: 4, o: '0.0001' },
      { v: 5, o: '0.00001' },
      { v: 6, o: '0.000001' },
      { v: 7, o: '0.0000001' },
      { v: 8, o: '0.00000001' },
      { v: 9, o: '0.000000001' },
      { v: -1, o: '10' },
      { v: -2, o: '100' },
      { v: -3, o: '1000' },
    ])('formats with toNumber given number correctly', ({ v, o }) => {
      expect(toDecimal(v)).toStrictEqual(o);
    });
  });

  describe('positive and negative decimals should be handled correctly', () => {
    const baseNum = '2000';
    const methods = [removeDecimal, toBigNum];
    it.each([
      { decimals: 0, result: ['2000', '2000'] },
      { decimals: 1, result: ['20000', '200'] },
      { decimals: -1, result: ['200', '20000'] },
      { decimals: 2, result: ['200000', '20'] },
      { decimals: -2, result: ['20', '200000'] },
      { decimals: 3, result: ['2000000', '2'] },
      { decimals: -3, result: ['2', '2000000'] },
      { decimals: 4, result: ['20000000', '0.2'] },
      { decimals: -4, result: ['0', '20000000'] }, // removeDecimal has toFixed(0) at the end
    ])(
      'number methods should handle negative decimals',
      ({ decimals, result }) => {
        methods.forEach((method, i) => {
          expect(method(baseNum, decimals).toString()).toEqual(result[i]);
        });
      }
    );
  });
});

describe('quantumDecimalPlaces', () => {
  it.each([
    ['1', 1, 3],
    ['10', 1, 2],
    ['100', 1, 1],
    ['1000', 1, 0],
    ['1', 2, 4],
    ['10', 2, 3],
    ['100', 2, 2],
    ['1000', 2, 1],
    ['1', 3, 5],
    ['10', 3, 4],
    ['100', 3, 3],
    ['1000', 3, 2],
    ['1', 18, 20],
    ['1000000000', 18, 11],
    ['5000000000', 18, 11],
    ['1000000000000000000', 18, 2],
  ])(
    'converts quantum %s of %d decimal places to %d quant. decimal places',
    (quantum, decimals, output) => {
      expect(quantumDecimalPlaces(quantum, decimals)).toEqual(output);
    }
  );
});

describe('getUnlimitedThreshold', () => {
  it.each([
    [
      0,
      '9.26336713898529563388567880069503262826159877325124512315660672063305037119488e+76',
    ],
    [
      1,
      '9.26336713898529563388567880069503262826159877325124512315660672063305037119488e+75',
    ],
    [
      2,
      '9.26336713898529563388567880069503262826159877325124512315660672063305037119488e+74',
    ],
    [
      3,
      '9.26336713898529563388567880069503262826159877325124512315660672063305037119488e+73',
    ],
    [
      10,
      '9.26336713898529563388567880069503262826159877325124512315660672063305037119488e+66',
    ],
    [
      18,
      '9.26336713898529563388567880069503262826159877325124512315660672063305037119488e+58',
    ],
  ])(
    'given %d decimal places it returns unlimited threshold %s',
    (decimals, output) => {
      expect(getUnlimitedThreshold(decimals).toString()).toEqual(output);
    }
  );
});

describe('formatNumberRounded', () => {
  it('rounds number with symbol', () => {
    expect(formatNumberRounded(new BigNumber(1))).toBe('1');
    expect(formatNumberRounded(new BigNumber(1_000))).toBe('1,000');
    expect(formatNumberRounded(new BigNumber(1_000_000))).toBe('1m');
    expect(formatNumberRounded(new BigNumber(1_000_000_000))).toBe('1b');
    expect(formatNumberRounded(new BigNumber(1_000_000_000_000))).toBe('1t');
  });

  it('respects the limit parameter', () => {
    expect(formatNumberRounded(new BigNumber(1_000), '1e3')).toBe('1k');
    expect(formatNumberRounded(new BigNumber(1_000_000), '1e9')).toBe(
      '1,000,000'
    );
    expect(formatNumberRounded(new BigNumber(9_999_999), '1e9')).toBe(
      '9,999,999'
    );
    expect(formatNumberRounded(new BigNumber(1_000_000_000), '1e9')).toBe('1b');
    expect(formatNumberRounded(new BigNumber(1_000_000_000), '1e12')).toBe(
      '1,000,000,000'
    );
    expect(formatNumberRounded(new BigNumber(1_000_000_000_000), '1e9')).toBe(
      '1t'
    );
  });
});

describe('toQUSD', () => {
  it.each([
    [0, 0, 0],
    [1, 1, 1],
    [1, 10, 0.1],
    [1, 100, 0.01],
    // real life examples
    [1000000, 1000000, 1], // USDC -> 1 USDC ~= 1 qUSD
    [500000, 1000000, 0.5], // USDC => 0.6 USDC ~= 0.5 qUSD
    [1e18, 1e18, 1], // VEGA -> 1 VEGA ~= 1 qUSD
    [123.45e18, 1e18, 123.45], // VEGA -> 1 VEGA ~= 1 qUSD
    [1e18, 5e14, 2000], // WETH -> 1 WETH ~= 2000 qUSD
    [1e9, 5e14, 0.000002], // gwei -> 1 gwei ~= 0.000002 qUSD
    [50000e9, 5e14, 0.1], // gwei -> 50000 gwei ~= 0.1 qUSD
  ])('converts (%d, %d) to %d qUSD', (amount, quantum, expected) => {
    expect(toQUSD(amount, quantum).toNumber()).toEqual(expected);
  });
});
