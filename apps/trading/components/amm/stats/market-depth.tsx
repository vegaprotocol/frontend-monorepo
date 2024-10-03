import { useMarketDepth, type Market } from '@vegaprotocol/rest';
import BigNumber from 'bignumber.js';
import compact from 'lodash/compact';
import { Currency } from '../currency';

export const MarketDepth = ({ market }: { market: Market }) => {
  const { data: marketDepth } = useMarketDepth(market.id);

  const buys = compact(
    marketDepth?.buy.map((a) => a.price.value.multipliedBy(a.volume.value))
  );
  const sells = compact(
    marketDepth?.sell.map((a) => a.price.value.multipliedBy(a.volume.value))
  );

  const buysSum = BigNumber.sum.apply(null, [...buys, BigNumber(0)]);
  const sellsSum = BigNumber.sum.apply(null, [...sells, BigNumber(0)]);

  return (
    <Currency
      value={buysSum.plus(sellsSum)}
      symbol={market.quoteSymbol}
      formatDecimals={market.decimalPlaces}
    />
  );
};
