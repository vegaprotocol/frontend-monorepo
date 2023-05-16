import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import {
  addDecimalsFormatNumber,
  formatNumber,
  priceChangePercentage,
} from '@vegaprotocol/utils';
import type { MarketMaybeWithDataAndCandles } from '@vegaprotocol/markets';
import { useMarketDataUpdateSubscription } from '@vegaprotocol/markets';
import { Sparkline } from '@vegaprotocol/ui-toolkit';

export const MarketSelectorItem = ({
  market,
  style,
  currentMarketId,
  onSelect,
}: {
  market: MarketMaybeWithDataAndCandles;
  style: CSSProperties;
  currentMarketId?: string;
  onSelect?: (marketId: string) => void;
}) => {
  const wrapperClasses = classNames(
    'block bg-vega-light-100 dark:bg-vega-dark-100 rounded-lg p-4',
    'min-h-[120px]',
    {
      'ring-1 ring-vega-light-300 dark:ring-vega-dark-300':
        currentMarketId === market.id,
    }
  );
  return (
    <div style={style} className="my-0.5 px-4">
      <Link
        to={`/markets/${market.id}`}
        className={wrapperClasses}
        onClick={() => {
          onSelect && onSelect(market.id);
        }}
      >
        <h3>{market.tradableInstrument.instrument.code}</h3>
        <h4
          title={market.tradableInstrument.instrument.name}
          className="text-sm text-vega-light-300 dark:text-vega-dark-300 text-ellipsis whitespace-nowrap overflow-hidden"
        >
          {market.tradableInstrument.instrument.name}
        </h4>
        <MarketData market={market} />
      </Link>
    </div>
  );
};

const MarketData = ({ market }: { market: MarketMaybeWithDataAndCandles }) => {
  const { data } = useMarketDataUpdateSubscription({
    variables: {
      marketId: market.id,
    },
  });

  const marketData = data?.marketsData[0];

  // use market data price if available as this is comes from
  // the subscription
  const price = marketData
    ? addDecimalsFormatNumber(marketData.markPrice, market.decimalPlaces)
    : market.data
    ? addDecimalsFormatNumber(market.data.markPrice, market.decimalPlaces)
    : '-';

  return (
    <div className="flex flex-nowrap justify-between items-center mt-1">
      <div className="w-1/2">
        <div
          className="text-ellipsis whitespace-nowrap overflow-hidden"
          data-testid="market-item-price"
        >
          {price}
        </div>
        {market.candles && (
          <PriceChange candles={market.candles.map((c) => c.close)} />
        )}
      </div>
      <div className="w-1/2 max-w-[120px]">
        {market.candles ? (
          <Sparkline
            width={120}
            height={20}
            data={market.candles.filter(Boolean).map((c) => Number(c.close))}
          />
        ) : (
          '-'
        )}
      </div>
    </div>
  );
};

const PriceChange = ({ candles }: { candles: string[] }) => {
  const priceChange = candles ? priceChangePercentage(candles) : undefined;
  const priceChangeClasses = classNames('text-xs', {
    'text-vega-pink': priceChange && priceChange < 0,
    'text-vega-green': priceChange && priceChange > 0,
  });
  let prefix = '';
  if (priceChange && priceChange > 0) {
    prefix = '+';
  }
  const formattedChange = formatNumber(Number(priceChange), 2);
  return (
    <div className={priceChangeClasses} data-testid="market-item-change">
      {priceChange ? `${prefix}${formattedChange}%` : '-'}
    </div>
  );
};
