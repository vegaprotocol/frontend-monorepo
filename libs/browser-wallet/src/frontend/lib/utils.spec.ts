import {
  formatDate,
  formatDateTime,
  formatNanoDate,
  formatTime,
  nanoSecondsToMilliseconds,
} from './utils';

describe('nanoSecondsToMilliseconds', () => {
  it('should convert nanoseconds to milliseconds correctly', () => {
    expect(nanoSecondsToMilliseconds('1000000000')).toBe(1000);
    expect(nanoSecondsToMilliseconds('5000000000')).toBe(5000);
    expect(nanoSecondsToMilliseconds('15000000000')).toBe(15_000);
  });
});

describe('formatNanoDate', () => {
  it('should format nanoSeconds to a valid date string', () => {
    const nanoSeconds = '1640995200000000000';
    const expected = '1/1/2022, 12:00:00 AM';

    expect(formatNanoDate(nanoSeconds)).toBe(expected);
  });

  it('should handle invalid nanoSeconds and return an error message', () => {
    const nanoSeconds = 'invalid';
    const expected = 'Invalid time value: invalid';

    expect(formatNanoDate(nanoSeconds)).toBe(expected);
  });
});

describe('formatDateTime', () => {
  it('should format milliseconds date to a readable format correctly', () => {
    expect(formatDateTime('invalid')).toBe('Invalid time value: invalid');
    expect(formatDateTime(1_612_432_362_000)).toBe('2/4/2021, 9:52:42 AM');
  });
});

describe('formatDate', () => {
  it('should format milliseconds date to a readable format correctly', () => {
    expect(formatDate('invalid')).toBe('Invalid time value: invalid');
    expect(formatDate(1_612_432_362_000)).toBe('2/4/2021');
  });
});

describe('formatTime', () => {
  it('should format milliseconds date to a readable format correctly', () => {
    expect(formatTime('invalid')).toBe('Invalid time value: invalid');
    expect(formatTime(1_612_432_362_000)).toBe('9:52:42 AM');
  });
});
