import { t } from '@vegaprotocol/i18n';
import type { MarketMaybeWithDataAndCandles } from '@vegaprotocol/market-list';
import {
  useMarketDataUpdateSubscription,
  useMarketList,
} from '@vegaprotocol/market-list';
import {
  MarketStateMapping,
  MarketTradingModeMapping,
} from '@vegaprotocol/types';
import { Sparkline, TinyScroll } from '@vegaprotocol/ui-toolkit';
import { addDecimalsFormatNumber } from '@vegaprotocol/utils';
import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { FixedSizeList } from 'react-window';

export const MarketSelector = ({
  width,
  height,
}: {
  width: number;
  height: number;
}) => {
  const { data, loading, error } = useMarketList();

  if (loading || !data) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error.message}</div>;
  }

  const row = ({ index, style }: { index: number; style: CSSProperties }) => {
    const market = data[index];
    return (
      <div style={style} className="mb-0.5 px-2">
        <Link
          to={`/markets/${market.id}`}
          className="block bg-vega-light-100 dark:bg-vega-dark-100 rounded-lg p-4"
        >
          <div>{market.tradableInstrument.instrument.code}</div>
          <div
            title={market.tradableInstrument.instrument.name}
            className="text-sm text-vega-light-300 dark:text-vega-dark-300 text-ellipsis whitespace-nowrap overflow-hidden"
          >
            {market.tradableInstrument.instrument.name}
          </div>
          <div className="flex justify-between items-center mt-1">
            <div>
              <div>
                {market.data
                  ? addDecimalsFormatNumber(
                      market.data.markPrice,
                      market.decimalPlaces
                    )
                  : '-'}
              </div>
              <div className="text-vega-pink text-xs">-1.02%</div>
            </div>
            <div>
              {market.candles ? (
                <Sparkline
                  width={120}
                  height={20}
                  data={market.candles
                    .filter(Boolean)
                    .map((c) => Number(c.close))}
                />
              ) : (
                '-'
              )}
            </div>
          </div>
          {/* <MarketData market={market} /> */}
        </Link>
      </div>
    );
  };

  return (
    <TinyScroll>
      <FixedSizeList
        className="virtualized-list"
        itemCount={data.length}
        itemSize={130}
        width={width}
        height={height}
      >
        {row}
      </FixedSizeList>
    </TinyScroll>
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
    <div className="text-xs">
      <div>
        {marketData ? MarketStateMapping[marketData.marketState] : '-'}
        {' | '}
        {marketData
          ? MarketTradingModeMapping[marketData.marketTradingMode]
          : '-'}
      </div>
      <div className="flex justify-between">
        <div>{t('Best bid price')}</div>
        <div>
          {marketData
            ? addDecimalsFormatNumber(
                marketData.bestBidPrice,
                market.decimalPlaces
              )
            : '-'}
        </div>
      </div>
      <div className="flex justify-between">
        <div>{t('Best bid volume')}</div>
        <div>
          {marketData
            ? addDecimalsFormatNumber(
                marketData.bestBidVolume,
                market.positionDecimalPlaces
              )
            : '-'}
        </div>
      </div>
    </div>
  );
};
