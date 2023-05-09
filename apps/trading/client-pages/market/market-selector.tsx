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
import { TinyScroll } from '@vegaprotocol/ui-toolkit';
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
      <div style={style}>
        <Link
          to={`/markets/${market.id}`}
          className="block py-1 px-4 hover:bg-vega-light-100"
        >
          <div>{market.tradableInstrument.instrument.code}</div>
          <MarketData market={market} />
        </Link>
      </div>
    );
  };

  return (
    <TinyScroll>
      <FixedSizeList
        className="virtualized-list"
        itemCount={data.length}
        itemSize={80}
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
