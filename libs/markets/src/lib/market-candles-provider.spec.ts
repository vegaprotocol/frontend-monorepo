import { update } from './market-candles-provider';

describe('market candles provider update', () => {
  const price = 153350000;
  const volume = 50;
  const data = [
    {
      high: price.toString(),
      low: price.toString(),
      open: price.toString(),
      close: price.toString(),
      notional: (price * volume).toString(),
      volume: '50',
      periodStart: '2022-11-01T15:49:00Z',
    },
  ];
  it('updates last candle if periodStart matches', () => {
    const delta = { ...data[0] };
    expect(update(data, delta)[0]).toBe(delta);
  });

  it('adds candle if periodStart is newer than last periodStart', () => {
    const delta = { ...data[0], periodStart: '2022-11-01T15:50:00Z' };
    expect(update(data, delta)[1]).toBe(delta);
  });

  it('omits update if periodStart older than last periodStart', () => {
    const delta = { ...data[0], periodStart: '2022-11-01T15:48:00Z' };
    expect(update(data, delta)).toBe(data);
  });

  it('returns [delta] if data is was empty', () => {
    const delta = data[0];
    expect(update(null, delta).length).toBe(1);
    expect(update([], delta).length).toBe(1);
  });
});
