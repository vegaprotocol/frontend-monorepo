import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import { addDecimalsFormatNumber } from '@vegaprotocol/utils';
import type { MarketMaybeWithDataAndCandles } from '@vegaprotocol/markets';
import { calcCandleVolume, getAsset } from '@vegaprotocol/markets';
import { useCandles } from '@vegaprotocol/markets';
import { useMarketDataUpdateSubscription } from '@vegaprotocol/markets';
import { Sparkline } from '@vegaprotocol/ui-toolkit';
import {
  MarketTradingMode,
  MarketTradingModeMapping,
} from '@vegaprotocol/types';
import { MarketProductPill } from '@vegaprotocol/datagrid';
import { useT } from '../../lib/use-t';

export const MarketSelectorItem = ({
  market,
  style,
  currentMarketId,
  onSelect,
  allProducts,
}: {
  market: MarketMaybeWithDataAndCandles;
  style: CSSProperties;
  currentMarketId?: string;
  onSelect: (marketId: string) => void;
  allProducts: boolean;
}) => {
  return (
    <div style={style} role="row">
      <Link
        to={`/markets/${market.id}`}
        className={classNames('h-full flex items-center gap-2 mx-2 px-2', {
          'hover:bg-vega-clight-700 dark:hover:bg-vega-cdark-700':
            market.id !== currentMarketId,
          'bg-vega-clight-600 dark:bg-vega-cdark-600':
            market.id === currentMarketId,
        })}
        onClick={() => onSelect(market.id)}
      >
        <MarketData market={market} allProducts={allProducts} />
      </Link>
    </div>
  );
};

const MarketData = ({
  market,
  allProducts,
}: {
  market: MarketMaybeWithDataAndCandles;
  allProducts: boolean;
}) => {
  const t = useT();
  const { data } = useMarketDataUpdateSubscription({
    variables: {
      marketId: market.id,
    },
    fetchPolicy: 'no-cache',
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
    : market.data
    ? market.data.marketTradingMode
    : market.tradingMode;

  const mode = [
    MarketTradingMode.TRADING_MODE_BATCH_AUCTION,
    MarketTradingMode.TRADING_MODE_MONITORING_AUCTION,
    MarketTradingMode.TRADING_MODE_OPENING_AUCTION,
  ].includes(marketTradingMode)
    ? MarketTradingModeMapping[marketTradingMode]
    : '';

  const { oneDayCandles } = useCandles({ marketId: market.id });

  const vol = oneDayCandles ? calcCandleVolume(oneDayCandles) : '0';
  const volume =
    vol && vol !== '0'
      ? addDecimalsFormatNumber(vol, market.positionDecimalPlaces)
      : '0.00';

  const productType = market.tradableInstrument.instrument.product.__typename;
  const symbol = getAsset(market).symbol || '';

  return (
    <>
      <div className="w-2/5" role="gridcell">
        <h3 className="flex items-baseline">
          <span className="overflow-hidden text-sm lg:text-base text-ellipsis whitespace-nowrap">
            {market.tradableInstrument.instrument.code}
          </span>
          {allProducts && productType && (
            <MarketProductPill productType={productType} />
          )}
        </h3>
        {mode && (
          <p className="text-xs text-vega-orange-500 dark:text-vega-orange-550 whitespace-nowrap">
            {mode}
          </p>
        )}
      </div>
      <div
        className="w-1/5 overflow-hidden text-xs lg:text-sm whitespace-nowrap text-ellipsis"
        title={symbol}
        data-testid="market-selector-price"
        role="gridcell"
      >
        {price} {symbol}
      </div>
      <div
        className="w-1/5 overflow-hidden text-xs text-right lg:text-sm whitespace-nowrap text-ellipsis"
        title={t('24h vol')}
        data-testid="market-selector-volume"
        role="gridcell"
      >
        {volume}
      </div>
      <div className="flex justify-end w-1/5" role="gridcell">
        {oneDayCandles && (
          <Sparkline
            width={64}
            height={15}
            data={oneDayCandles.map((c) => Number(c.close))}
          />
        )}
      </div>
    </>
  );
};
