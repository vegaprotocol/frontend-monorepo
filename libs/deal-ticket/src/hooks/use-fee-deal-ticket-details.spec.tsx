import { formatRange, formatValue } from './use-fee-deal-ticket-details';

describe('useFeeDealTicketDetails', () => {
  it.each([
    { v: 123000, d: 5, o: '1.23' },
    { v: 123000, d: 3, o: '123.00' },
    { v: 123000, d: 1, o: '12,300.0' },
    { v: 123001000, d: 2, o: '1,230,010.00' },
    { v: 123001, d: 2, o: '1,230.01' },
    {
      v: '123456789123456789',
      d: 10,
      o: '12,345,678.91234568',
    },
  ])('formats values correctly', ({ v, d, o }) => {
    expect(formatValue(v, d)).toStrictEqual(o);
  });

  it.each([
    { v: 123000, d: 5, o: '1.23', q: '0.1' },
    { v: 123000, d: 3, o: '123.00', q: '0.1' },
    { v: 123000, d: 1, o: '12,300.00', q: '0.1' },
    { v: 123001000, d: 2, o: '1,230,010.00', q: '0.1' },
    { v: 123001, d: 2, o: '1,230', q: '100' },
    { v: 123001, d: 2, o: '1,230.01', q: '0.1' },
    {
      v: '123456789123456789',
      d: 10,
      o: '12,345,678.9123457',
      q: '0.00003846',
    },
  ])(
    'formats with formatValue with quantum given number correctly',
    ({ v, d, o, q }) => {
      expect(formatValue(v.toString(), d, q)).toStrictEqual(o);
    }
  );

  it.each([
    { min: 123000, max: 12300011111, d: 5, o: '1.23 - 123,000.111', q: '0.1' },
    {
      min: 123000,
      max: 12300011111,
      d: 3,
      o: '123.00 - 12,300,011.111',
      q: '0.1',
    },
    {
      min: 123000,
      max: 12300011111,
      d: 1,
      o: '12,300.00 - 1,230,001,111.10',
      q: '0.1',
    },
    {
      min: 123001000,
      max: 12300011111,
      d: 2,
      o: '1,230,010 - 123,000,111',
      q: '100',
    },
  ])(
    'formats with formatValue with quantum given number correctly',
    ({ min, max, d, o, q }) => {
      expect(formatRange(min, max, d, q)).toStrictEqual(o);
    }
  );
});
