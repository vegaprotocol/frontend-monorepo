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
  const wrapperClasses = classNames('py-1 px-4', {
    'bg-vega-light-100 dark:bg-vega-dark-100': market.id === currentMarketId,
  });
  return (
    <div style={style} className={wrapperClasses}>
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
    <div className="flex gap-2">
      <div>
        <h3 className="text-ellipsis whitespace-nowrap overflow-hidden">
          {market.tradableInstrument.instrument.code}
        </h3>
        {mode && (
          <p className="text-xs text-vega-orange-500 dark:text-vega-orange-550 whitespace-nowrap">
            {mode}
          </p>
        )}
      </div>
      <div className="flex-1">
        <DataRow value={volume} label={t('24h vol')} />
        <DataRow
          value={price}
          label={instrument.product.settlementAsset.symbol}
        />
      </div>
      <div className="hidden lg:block w-[70px]">
        {oneDayCandles && (
          <Sparkline
            width={70}
            height={15}
            data={oneDayCandles.map((c) => Number(c.close))}
          />
        )}
      </div>
    </div>
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
