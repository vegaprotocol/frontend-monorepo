import { deadlineToSeconds, secondsToRoundedHours } from './deadline-helpers';

describe('deadlineToSeconds', () => {
  it('should throw an error if the deadline does not match the format "XhXmXs"', () => {
    expect(() => deadlineToSeconds('abcde')).toThrowError(
      'Invalid deadline format, expected format "XhXmXs", got "abcde"'
    );
  });

  it('should convert "0h0m1s" to 1', () => {
    expect(deadlineToSeconds('0h0m1s')).toEqual(1);
  });

  it('should convert "0h1m0s" to 60', () => {
    expect(deadlineToSeconds('0h1m0s')).toEqual(60);
  });

  it('should convert "1h0m0s" to 3600', () => {
    expect(deadlineToSeconds('1h0m0s')).toEqual(3600);
  });

  it('should convert "1h1m1s" to 3661', () => {
    expect(deadlineToSeconds('1h1m1s')).toEqual(3661);
  });
});

describe('secondsToRoundedHours', () => {
  it('should return 1 hour for anything up to 3600 seconds', () => {
    expect(secondsToRoundedHours(0)).toEqual(1);
    expect(secondsToRoundedHours(3600)).toEqual(1);
  });

  it('should round to the nearest hour for anything more than 3600 seconds', () => {
    // 5399 seconds is 1 hour 29 minutes 59 seconds
    expect(secondsToRoundedHours(5399)).toEqual(1);
    expect(secondsToRoundedHours(5400)).toEqual(2);
    // 8999 seconds is 2 hours 29 minutes 59 seconds
    expect(secondsToRoundedHours(8999)).toEqual(2);
    expect(secondsToRoundedHours(9000)).toEqual(3);
  });
});
