import BigNumber from 'bignumber.js';

import {
  addDecimalsFormatNumber,
  addDecimalsFormatNumberQuantum,
  formatNumber,
  formatNumberPercentage,
  isNumeric,
  removeDecimal,
  toBigNum,
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
