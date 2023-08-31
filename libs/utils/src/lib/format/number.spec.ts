import BigNumber from 'bignumber.js';

import {
  addDecimalsFormatNumber,
  addDecimalsFormatNumberQuantum,
  formatNumber,
  formatNumberPercentage,
  getUnlimitedThreshold,
  isNumeric,
  quantumDecimalPlaces,
  toDecimal,
  toNumberParts,
} from './number';

describe('number utils', () => {
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
    { v: new BigNumber(123000), d: 5, o: '1.23', q: 0.1 },
    { v: new BigNumber(123000), d: 3, o: '123.00', q: 0.1 },
    { v: new BigNumber(123000), d: 1, o: '12,300.00', q: 0.1 },
    { v: new BigNumber(123001000), d: 2, o: '1,230,010.00', q: 0.1 },
    { v: new BigNumber(123001), d: 2, o: '1,230.01', q: 100 },
    { v: new BigNumber(123001), d: 2, o: '1,230.01', q: 0.1 },
    { v: new BigNumber(123001), d: 2, o: '1,230.01', q: 1 },
    {
      v: BigNumber('123456789123456789'),
      d: 10,
      o: '12,345,678.91234568',
      q: '0.00003846',
    },
    {
      v: BigNumber('123456789123456789'),
      d: 10,
      o: '12,345,678.91234568',
      q: '1',
    },
    // USDT / USDC
    { v: new BigNumber(12345678), d: 6, o: '12.35', q: 1000000 },
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
    { v: new BigNumber(123), d: undefined, o: '123.00%' }, // it default to 2 decimal places
    { v: new BigNumber(30000), d: undefined, o: '30,000.00%' },
    { v: new BigNumber(3.000001), d: undefined, o: '3.000001%' },
  ])('formats given number correctly', ({ v, d, o }) => {
    expect(formatNumberPercentage(v, d)).toStrictEqual(o);
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
    ])('formats with toNumber given number correctly', ({ v, o }) => {
      expect(toDecimal(v)).toStrictEqual(o);
    });
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
