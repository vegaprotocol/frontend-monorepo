import BigNumber from 'bignumber.js';

export const priceChangePercentage = (candles: string[]) => {
  if (!candles.length) {
    return 0;
  }

  const change = priceChange(candles);

  return new BigNumber(change.toString())
    .dividedBy(new BigNumber(candles[0]))
    .multipliedBy(100)
    .toNumber();
};

export const priceChange = (candles: string[]) => {
  return candles &&
    candles[candles.length - 1] !== undefined &&
    candles[0] !== undefined
    ? BigInt(candles[candles.length - 1] ?? 0) - BigInt(candles[0] ?? 0)
    : 0;
};
