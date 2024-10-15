import { useMarketData, type Market } from '@vegaprotocol/rest';
import { Currency } from '../currency';

export const MarkPrice = ({ market }: { market: Market }) => {
  const { data: marketData } = useMarketData(market.id);

  return (
    <Currency
      value={marketData?.markPrice}
      symbol={market.quoteSymbol}
      formatDecimals={market.decimalPlaces}
    />
  );
};
