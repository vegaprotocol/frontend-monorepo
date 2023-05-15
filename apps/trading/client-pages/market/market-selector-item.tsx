import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import {
  addDecimalsFormatNumber,
  formatNumber,
  priceChangePercentage,
} from '@vegaprotocol/utils';
import type { MarketMaybeWithDataAndCandles } from '@vegaprotocol/market-list';
import { useMarketDataUpdateSubscription } from '@vegaprotocol/market-list';
import { Sparkline } from '@vegaprotocol/ui-toolkit';

export const MarketSelectorItem = ({
  market,
  style,
  currentMarketId,
}: {
  market: MarketMaybeWithDataAndCandles;
  style: CSSProperties;
  currentMarketId?: string;
}) => {
  const wrapperClasses = classNames(
    'block bg-vega-light-100 dark:bg-vega-dark-100 rounded-lg p-4',
    {
      'ring-1 ring-vega-light-300 dark:ring-vega-dark-300':
        currentMarketId === market.id,
    }
  );
  return (
    <div style={style} className="my-0.5 pl-4 pr-3">
      <Link to={`/markets/${market.id}`} className={wrapperClasses}>
        <div>{market.tradableInstrument.instrument.code}</div>
        <div
          title={market.tradableInstrument.instrument.name}
          className="text-sm text-vega-light-300 dark:text-vega-dark-300 text-ellipsis whitespace-nowrap overflow-hidden"
        >
          {market.tradableInstrument.instrument.name}
        </div>
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

  return (
    <div className="flex flex-nowrap justify-between items-center mt-1">
      <div className="w-1/2">
        <div className="text-ellipsis whitespace-nowrap overflow-hidden">
          {marketData
            ? addDecimalsFormatNumber(
                marketData.markPrice,
                market.decimalPlaces
              )
            : '-'}
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
    <div className={priceChangeClasses}>
      {priceChange ? `${prefix}${formattedChange}%` : '-'}
    </div>
  );
};
