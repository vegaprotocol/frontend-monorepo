import { getSecondsFromInterval } from './time';

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
