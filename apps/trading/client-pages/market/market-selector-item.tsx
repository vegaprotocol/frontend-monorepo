import type { CSSProperties, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import {
  addDecimalsFormatNumber,
  formatNumber,
  priceChangePercentage,
} from '@vegaprotocol/utils';
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
  return (
    <div style={style} className="my-0.5 px-4">
      <Link to={`/markets/${market.id}`} className="block">
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
    <div className="grid gap-2 grid-cols-[150px_1fr_120px]">
      <div>
        <div className="text-ellipsis whitespace-nowrap overflow-hidden">
          {market.tradableInstrument.instrument.code}
        </div>
        {mode && (
          <p className="text-xs text-vega-orange-500 dark:text-vega-orange-550 whitespace-nowrap">
            {mode}
          </p>
        )}
      </div>
      <div>
        <DataRow value={volume} label={t('24h vol')} />
        <DataRow
          value={price}
          label={instrument.product.settlementAsset.symbol}
        />
      </div>
      <div>
        {oneDayCandles && (
          <Sparkline
            width={120}
            height={20}
            data={oneDayCandles.map((c) => Number(c.close))}
          />
        )}
      </div>
    </div>
  );

  return (
    <>
      <div className="flex items-end gap-1 mb-1">
        <h3
          className={classNames(
            'overflow-hidden text-ellipsis whitespace-nowrap',
            {
              'w-1/2': mode, // make space for showing the trading mode
            }
          )}
        >
          {market.tradableInstrument.instrument.code}
        </h3>
        {mode && (
          <p className="w-1/2 text-xs text-right text-vega-orange-500 dark:text-vega-orange-550">
            {mode}
          </p>
        )}
      </div>
      <DataRow value={volume} label={t('24h vol')} />
      <DataRow
        value={price}
        label={instrument.product.settlementAsset.symbol}
      />
      <div className="relative text-xs p-1">
        {oneDayCandles && (
          <PriceChange candles={oneDayCandles.map((c) => c.close)} />
        )}

        <div
          // absolute so height is not larger than price change value
          className="absolute right-0 bottom-0 w-[120px]"
        >
          {oneDayCandles && (
            <Sparkline
              width={120}
              height={20}
              data={oneDayCandles.map((c) => Number(c.close))}
            />
          )}
        </div>
      </div>
    </>
  );
};

const DataRow = ({
  value,
  label,
}: {
  value: string | ReactNode;
  label: string;
}) => {
  return (
    <div
      className="text-ellipsis whitespace-nowrap overflow-hidden leading-tight text-right"
      data-testid="market-selector-data-row"
    >
      <span className="text-xs text-vega-light-300 dark:text-vega-light-300">
        {label}
      </span>
      <span title={label} className="text-sm ml-1">
        {value}
      </span>
    </div>
  );
};

const PriceChange = ({ candles }: { candles: string[] }) => {
  const priceChange = candles ? priceChangePercentage(candles) : undefined;
  const priceChangeClasses = classNames('text-xs', {
    'text-market-red': priceChange && priceChange < 0,
    'text-market-green-600 dark:text-market-green':
      priceChange && priceChange > 0,
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
