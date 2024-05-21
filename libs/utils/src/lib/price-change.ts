import BigNumber from 'bignumber.js';

export const priceChangePercentage = (candles: string[]) => {
  if (!candles.length) {
    return 0;
  }

  const change = priceChange(candles);

  // choose the first candle that is not empty
  const firstCandle = candles.find((candle) => candle !== '' && candle);
  if (!firstCandle) {
    return 0;
  }

  const result = new BigNumber(change.toString())
    .dividedBy(firstCandle !== '0' ? firstCandle : '1')
    .multipliedBy(100);

  return result.isNaN() ? 0 : result.toNumber();
};

export const priceChange = (candles: string[]) => {
  const firstCandle = candles.find((candle) => candle !== '' && candle);
  const lastCandle = candles
    .reverse()
    .find((candle) => candle !== '' && candle);
  return candles && lastCandle !== undefined && firstCandle !== undefined
    ? BigInt(lastCandle ?? 0) - BigInt(firstCandle ?? 0)
    : 0;
};
