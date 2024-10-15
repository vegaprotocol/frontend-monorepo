import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@vegaprotocol/ui-toolkit';
import { addDecimalsFormatNumber } from '@vegaprotocol/utils';
import type { MarketMaybeWithDataAndCandles } from '@vegaprotocol/markets';
import {
  calcCandleVolume,
  getProductType,
  getQuoteName,
} from '@vegaprotocol/markets';
import { useCandles } from '@vegaprotocol/markets';
import { useMarketDataUpdateSubscription } from '@vegaprotocol/markets';
import { Sparkline } from '@vegaprotocol/ui-toolkit';
import { useT } from '../../lib/use-t';
import { EmblemByMarket } from '@vegaprotocol/emblem';
import { useChainId } from '@vegaprotocol/wallet-react';
import { MarketIcon } from '../../client-pages/markets/market-icon';
import { MarketProductPill } from '@vegaprotocol/datagrid';

export const MarketSelectorItem = ({
  market,
  style,
  currentMarketId,
  onSelect,
}: {
  market: MarketMaybeWithDataAndCandles;
  style: CSSProperties;
  currentMarketId?: string;
  onSelect: (marketId: string) => void;
}) => {
  return (
    <div style={style} role="row">
      <Link
        to={`/markets/${market.id}`}
        className={cn(
          'h-full grid grid-cols-6 sm:grid-cols-12 items-center gap-2 mx-2 px-2',
          {
            'hover:bg-surface-3': market.id !== currentMarketId,
            'bg-surface-2': market.id === currentMarketId,
          }
        )}
        onClick={() => onSelect(market.id)}
      >
        <MarketData market={market} />
      </Link>
    </div>
  );
};

const MarketData = ({ market }: { market: MarketMaybeWithDataAndCandles }) => {
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

  const { oneDayCandles } = useCandles({ marketId: market.id });
  const { chainId } = useChainId();

  const vol = oneDayCandles ? calcCandleVolume(oneDayCandles) : '0';
  const volume =
    vol && vol !== '0'
      ? addDecimalsFormatNumber(vol, market.positionDecimalPlaces)
      : '0.00';

  const productType = getProductType(market);
  const symbol = getQuoteName(market);

  return (
    <>
      <div className="col-span-4 sm:col-span-5" role="gridcell">
        <h3 className="flex items-center gap-1">
          <EmblemByMarket market={market.id} vegaChain={chainId} size={26} />
          <span className="overflow-hidden text-ellipsis">
            {market.tradableInstrument.instrument.code}
          </span>
          <MarketProductPill productType={productType} />
          <MarketIcon data={market} />
        </h3>
      </div>
      <div
        className="col-span-2 sm:col-span-3 overflow-hidden text-xs lg:text-sm whitespace-nowrap text-ellipsis text-right"
        title={symbol}
        data-testid="market-selector-price"
        role="gridcell"
      >
        {price} {symbol}
      </div>
      <div
        className="hidden col-span-2 sm:flex justify-end overflow-hidden text-xs lg:text-sm whitespace-nowrap text-ellipsis text-right"
        title={t('24h vol')}
        data-testid="market-selector-volume"
        role="gridcell"
      >
        {volume}
      </div>
      <div className="hidden col-span-2 sm:flex justify-end" role="gridcell">
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
