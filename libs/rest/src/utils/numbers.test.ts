import { Decimal } from './numbers';

describe('Decimal', () => {
  test.each([
    { raw: '1', dp: 0, value: '1', formatted: '1' },
    { raw: '1', dp: 1, value: '0.1', formatted: '0.1' },
    { raw: '1', dp: 2, value: '0.01', formatted: '0.01' },
    { raw: '1', dp: -1, value: '10', formatted: '10' },
    { raw: '1', dp: -2, value: '100', formatted: '100' },
    { raw: '1000', dp: 2, value: '10', formatted: '10' },
    { raw: '1234', dp: 0, value: '1234', formatted: '1,234' },
    { raw: '1234', dp: 3, value: '1.234', formatted: '1.234' },
    { raw: '123456', dp: -1, value: '1234560', formatted: '1,234,560' },
    { raw: '1000', dp: -3, value: '1000000', formatted: '1,000,000' },
    { raw: '123456789', dp: 5, value: '1234.56789', formatted: '1,234.56789' },
    {
      raw: '123456789',
      dp: -5,
      value: '12345678900000',
      formatted: '12,345,678,900,000',
    },
    {
      raw: '1000000000',
      dp: 0,
      value: '1000000000',
      formatted: '1,000,000,000',
    },
  ])('Decimal instance $raw', (o) => {
    const x = new Decimal(o.raw, o.dp);
    expect(x.value.toString()).toBe(o.value);
    expect(x.rawValue).toBe(o.raw);
    expect(x.toFormat()).toBe(o.formatted);
  });

  test.each([
    { value: '10.00', dp: 2, raw: '1000' },
    { value: '10', dp: 2, raw: '1000' },
    { value: '12345.6', dp: 1, raw: '123456' },
    { value: '1200', dp: -2, raw: '12' },
  ])('floating point to integer $value', (o) => {
    expect(Decimal.toString(o.value, o.dp)).toBe(o.raw);
  });

  test.each([
    { raw: '1', dp: 0, value: '1' },
    { raw: '1', dp: 1, value: '0.1' },
    { raw: '1', dp: 2, value: '0.01' },
    { raw: '1000', dp: 2, value: '10' },
    { raw: '10', dp: 2, value: '0.1' },
    { raw: '1234', dp: 3, value: '1.234' },
    { raw: '1234', dp: -3, value: '1234000' },
  ])('integer to floating point $raw', (o) => {
    expect(Decimal.toBigNum(o.raw, o.dp).toString()).toBe(o.value);
  });

  test('format', () => {
    expect(Decimal.format('1234', 2)).toBe('12.34');
    expect(Decimal.format('1234', 2, 0)).toBe('12');
    expect(Decimal.format('1234', 2, 2)).toBe('12.34');
    expect(Decimal.format('1234007', 2, 2)).toBe('12,340.07');
    expect(Decimal.format('1234')).toBe('1,234');
    expect(Decimal.format('1999', 1, 0)).toBe('199');
  });

  test.each([
    { quantum: '1000000', dp: 6, value: 2 },
    { quantum: '100', dp: 2, value: 0 },
    { quantum: '50000000000000000000', dp: 18, value: 3 },
  ])('getQuantumDecimals quantum: $quantum dp: $dp', () => {
    expect(Decimal.getQuantumDecimals('1000000', 6)).toBe(2);
  });
});
