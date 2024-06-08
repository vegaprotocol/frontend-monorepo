import compact from 'lodash/compact';
import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import { addDecimalsFormatNumber } from '@vegaprotocol/utils';
import { useMarketDataUpdateSubscription } from '@vegaprotocol/markets';
import { Sparkline } from '@vegaprotocol/ui-toolkit';
import { useT } from '../../lib/use-t';
import { EmblemByMarket } from '@vegaprotocol/emblem';
import { useChainId } from '@vegaprotocol/wallet-react';
import { MarketIcon } from '../../client-pages/markets/market-icon';
import { ProductTypeShortName } from '@vegaprotocol/types';
import {
  type Market,
  getAsset,
  calcCandleVolume,
} from '../../lib/hooks/use-markets';

export const MarketSelectorItem = ({
  market,
  style,
  currentMarketId,
  onSelect,
  allProducts,
}: {
  market: Market;
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
  market: Market;
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

  const { chainId } = useChainId();

  const candles = compact(market.candlesConnection?.edges?.map((e) => e?.node));
  const vol = candles.length ? calcCandleVolume(candles) : '0';
  const volume =
    vol && vol !== '0'
      ? addDecimalsFormatNumber(vol, market.positionDecimalPlaces)
      : '0.00';

  const productType = market.tradableInstrument.instrument.product.__typename;
  const symbol = getAsset(market).symbol || '';

  return (
    <>
      <div className="w-4/6 sm:w-2/6" role="gridcell">
        <h3 className="flex items-center gap-1">
          <span className="shrink-0">
            <EmblemByMarket market={market.id} vegaChain={chainId} />
          </span>
          <div>
            <span className="overflow-hidden text-xs md:text-sm lg:text-base text-ellipsis whitespace-nowrap leading-none">
              {market.tradableInstrument.instrument.code}
            </span>
            <div className="flex items-center">
              {allProducts && productType && (
                <span className="text-xs uppercase text-muted mr-1">
                  {productType && ProductTypeShortName[productType]}
                </span>
              )}
              <MarketIcon data={market} />
            </div>
          </div>
        </h3>
      </div>
      <div
        className="w-2/6 overflow-hidden text-xs lg:text-sm whitespace-nowrap text-ellipsis text-right"
        title={symbol}
        data-testid="market-selector-price"
        role="gridcell"
      >
        {price} {symbol}
      </div>
      <div
        className="hidden sm:w-1/6 sm:flex justify-end overflow-hidden text-xs lg:text-sm whitespace-nowrap text-ellipsis text-right"
        title={t('24h vol')}
        data-testid="market-selector-volume"
        role="gridcell"
      >
        {volume}
      </div>
      <div className="hidden sm:w-1/6 sm:flex justify-end" role="gridcell">
        {candles && candles.length && (
          <Sparkline
            width={64}
            height={15}
            data={candles.map((c) => Number(c.close))}
          />
        )}
      </div>
    </>
  );
};
