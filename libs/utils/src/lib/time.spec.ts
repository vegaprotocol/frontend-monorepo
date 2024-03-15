import {
  convertToCountdownString,
  convertToDuration,
  getSecondsFromInterval,
} from './time';

describe('getSecondsFromInterval', () => {
  it('returns 0 for bad data', () => {
    expect(getSecondsFromInterval(null as unknown as string)).toEqual(0);
    expect(getSecondsFromInterval('')).toEqual(0);
    expect(getSecondsFromInterval('🧙')).toEqual(0);
    expect(getSecondsFromInterval(2 as unknown as string)).toEqual(0);
  });

  it('parses out months from a capital M', () => {
    expect(getSecondsFromInterval('2M')).toEqual(5184000);
  });

  it('parses out days from a capital D', () => {
    expect(getSecondsFromInterval('1D')).toEqual(86400);
  });

  it('parses out hours from a lower case h', () => {
    expect(getSecondsFromInterval('11h')).toEqual(39600);
  });

  it('parses out minutes from a lower case m', () => {
    expect(getSecondsFromInterval('10m')).toEqual(600);
  });

  it('parses out seconds from a lower case s', () => {
    expect(getSecondsFromInterval('99s')).toEqual(99);
  });

  it('parses complex examples', () => {
    expect(getSecondsFromInterval('24h')).toEqual(86400);
    expect(getSecondsFromInterval('1h30m')).toEqual(5400);
    expect(getSecondsFromInterval('1D1h30m1s')).toEqual(91801);
  });
});

describe('convertToCountdown', () => {
  it.each([
    [1 * 1000, [0, 0, 0, 1]],
    [2 * 1000, [0, 0, 0, 2]],
    [3999, [0, 0, 0, 3]],
    [1 * 60 * 1000 + 3 * 1000, [0, 0, 1, 3]],
    [12 * 60 * 1000 + 3 * 1000, [0, 0, 12, 3]],
    [3 * 60 * 60 * 1000 + 12 * 60 * 1000 + 3 * 1000, [0, 3, 12, 3]],
    [
      30 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000 + 12 * 60 * 1000 + 3 * 1000,
      [30, 3, 12, 3],
    ],
    [
      -1 *
        (30 * 24 * 60 * 60 * 1000 +
          3 * 60 * 60 * 1000 +
          12 * 60 * 1000 +
          3 * 1000),
      [30, 3, 12, 3],
    ],
  ])('converts %d ms to %s', (time, countdown) => {
    const duration = convertToDuration(time);
    expect(Object.values(duration)).toEqual(countdown);
  });
});

describe('convertToCountdownString', () => {
  it.each([
    [1 * 1000, '00m01s'],
    [2 * 1000, '00m02s'],
    [1 * 60 * 1000 + 3 * 1000, '01m03s'],
    [12 * 60 * 1000 + 3 * 1000, '12m03s'],
    [3 * 60 * 60 * 1000 + 12 * 60 * 1000 + 3 * 1000, '03h12m03s'],
    [
      30 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000 + 12 * 60 * 1000 + 3 * 1000,
      '30d03h12m03s',
    ],
  ])('converts %d ms to %s', (time, countdown) => {
    expect(convertToCountdownString(time)).toEqual(countdown);
  });
});
