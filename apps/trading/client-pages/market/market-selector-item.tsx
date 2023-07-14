import type { CSSProperties, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import { addDecimalsFormatNumber } from '@vegaprotocol/utils';
import type { MarketMaybeWithDataAndCandles } from '@vegaprotocol/markets';
import { calcCandleVolume } from '@vegaprotocol/markets';
import { useCandles } from '@vegaprotocol/markets';
import { useMarketDataUpdateSubscription } from '@vegaprotocol/markets';
import { Sparkline } from '@vegaprotocol/ui-toolkit';
import {
  MarketTradingMode,
  MarketTradingModeMapping,
} from '@vegaprotocol/types';
import { t } from '@vegaprotocol/i18n';

export const MarketSelectorItem = ({
  market,
  style,
  currentMarketId,
}: {
  market: MarketMaybeWithDataAndCandles;
  style: CSSProperties;
  currentMarketId?: string;
}) => {
  // 'py-1 px-2',
  return (
    <div style={style} role="row">
      <Link
        to={`/markets/${market.id}`}
        className={classNames('h-full flex items-center gap-2 px-4', {
          'hover:bg-vega-clight-700 dark:hover:bg-vega-cdark-700':
            market.id !== currentMarketId,
          'bg-vega-clight-600 dark:bg-vega-cdark-600':
            market.id === currentMarketId,
        })}
      >
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

  const marketTradingMode = marketData
    ? marketData.marketTradingMode
    : market.tradingMode;

  const mode = [
    MarketTradingMode.TRADING_MODE_BATCH_AUCTION,
    MarketTradingMode.TRADING_MODE_MONITORING_AUCTION,
    MarketTradingMode.TRADING_MODE_OPENING_AUCTION,
  ].includes(marketTradingMode)
    ? MarketTradingModeMapping[marketTradingMode]
    : '';

  const instrument = market.tradableInstrument.instrument;
  const { oneDayCandles } = useCandles({ marketId: market.id });

  const vol = oneDayCandles ? calcCandleVolume(oneDayCandles) : '0';
  const volume =
    vol && vol !== '0'
      ? addDecimalsFormatNumber(vol, market.positionDecimalPlaces)
      : '0.00';

  return (
    <>
      <div className="w-1/4" role="gridcell">
        <h3 className="text-ellipsis whitespace-nowrap overflow-hidden">
          {market.tradableInstrument.instrument.code}
        </h3>
        {mode && (
          <p className="text-xs text-vega-orange-500 dark:text-vega-orange-550 whitespace-nowrap">
            {mode}
          </p>
        )}
      </div>
      <div
        className="w-1/4 text-sm"
        title={instrument.product.settlementAsset.symbol}
        data-testid="market-selector-data-row"
        role="gridcell"
      >
        {price} {instrument.product.settlementAsset.symbol}
      </div>
      <div
        className="w-1/4 text-sm text-right"
        title={t('24h vol')}
        data-testid="market-selector-data-row"
        role="gridcell"
      >
        {volume}
      </div>
      <div className="w-1/4" role="gridcell">
        {oneDayCandles && (
          <Sparkline
            width={70}
            height={15}
            data={oneDayCandles.map((c) => Number(c.close))}
          />
        )}
      </div>
    </>
  );
};
