import BigNumber from 'bignumber.js';

export const priceChangePercentage = (candles: string[]) => {
  const change = priceChange(candles);
  if (change && candles && candles.length > 0) {
    const yesterdayLastPrice = candles[0] && BigInt(candles[0]);
    if (yesterdayLastPrice) {
      return new BigNumber(change.toString())
        .dividedBy(new BigNumber(yesterdayLastPrice.toString()))
        .multipliedBy(100)
        .toNumber();
    }
    return 0;
  }
  return 0;
};

export const priceChange = (candles: string[]) => {
  return candles &&
    candles[candles.length - 1] !== undefined &&
    candles[0] !== undefined
    ? BigInt(candles[candles.length - 1] ?? 0) - BigInt(candles[0] ?? 0)
    : 0;
};
