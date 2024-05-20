import BigNumber from 'bignumber.js';

export const priceChangePercentage = (candles: string[]) => {
  if (!candles.length) {
    return 0;
  }

  const change = priceChange(candles);

  const firstCandle = new BigNumber(candles[0]);
  if (firstCandle.isZero() || firstCandle.isNaN()) {
    return 0;
  }

  const result = new BigNumber(change.toString())
    .dividedBy(firstCandle)
    .multipliedBy(100);

  return result.isNaN() ? 0 : result.toNumber();
};

export const priceChange = (candles: string[]) => {
  return candles &&
    candles[candles.length - 1] !== undefined &&
    candles[0] !== undefined
    ? BigInt(candles[candles.length - 1] ?? 0) - BigInt(candles[0] ?? 0)
    : 0;
};
