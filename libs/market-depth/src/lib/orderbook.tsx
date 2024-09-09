import { useMemo, useRef, useState } from 'react';
import ReactVirtualizedAutoSizer from 'react-virtualized-auto-sizer';
import { addDecimalsFormatNumber } from '@vegaprotocol/utils';
import { usePrevious } from '@vegaprotocol/react-helpers';
import { OrderbookRow } from './orderbook-row';
import type { OrderbookRowData } from './orderbook-data';
import { compactRows, VolumeType } from './orderbook-data';
import {
  Splash,
  Tooltip,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { cn } from '@vegaprotocol/ui-toolkit';
import { OrderbookControls } from './orderbook-controls';
import { useT } from './use-t';
import { type PriceLevel } from './market-depth-provider';

// Sets row height, will be used to calculate number of rows that can be
// displayed each side of the book without overflow
export const rowHeight = 17;
const rowGap = 1;
const midHeight = 30;

const OrderbookSide = ({
  rows,
  type,
  decimalPlaces,
  positionDecimalPlaces,
  priceFormatDecimalPlaces,
  onClick,
  width,
  maxVol,
  bestAskPrice,
  bestBidPrice,
}: {
  rows: OrderbookRowData[];
  decimalPlaces: number;
  positionDecimalPlaces: number;
  priceFormatDecimalPlaces: number;
  type: VolumeType;
  onClick: (args: { price?: string; size?: string }) => void;
  width: number;
  maxVol: number;
  bestAskPrice: string;
  bestBidPrice: string;
}) => {
  return (
    <div
      className={
        // position the ask side to the bottow of the top section and the bid side to the top of the bottom section
        cn(
          'flex flex-col',
          type === VolumeType.ask ? 'justify-end' : 'justify-start'
        )
      }
    >
      <div
        className="grid"
        style={{ gridAutoRows: rowHeight, gap: rowGap }} // use style as tailwind won't compile the dynamically set height
      >
        {rows.map((data) => (
          <OrderbookRow
            key={data.price}
            price={data.price}
            onClick={onClick}
            decimalPlaces={decimalPlaces}
            positionDecimalPlaces={positionDecimalPlaces}
            priceFormatDecimalPlaces={priceFormatDecimalPlaces}
            volume={data.volume}
            cumulativeVolume={data.cumulativeVol}
            type={type}
            width={width}
            maxVol={maxVol}
            crossed={
              !!bestBidPrice &&
              !!bestAskPrice &&
              (type === VolumeType.ask
                ? BigInt(bestBidPrice) >= BigInt(data.price)
                : BigInt(bestAskPrice) <= BigInt(data.price))
            }
          />
        ))}
      </div>
    </div>
  );
};

export const OrderbookMid = ({
  lastTradedPrice,
  decimalPlaces,
  assetSymbol,
  bestAskPrice,
  bestBidPrice,
  indicativePrice,
  isMarketInAuction,
}: {
  lastTradedPrice: string;
  decimalPlaces: number;
  assetSymbol: string;
  bestAskPrice?: string;
  bestBidPrice?: string;
  indicativePrice: string;
  isMarketInAuction: boolean;
}) => {
  const t = useT();
  const currentPrice = isMarketInAuction ? indicativePrice : lastTradedPrice;
  const previousPrice = usePrevious(currentPrice);
  const priceChangeRef = useRef<'up' | 'down' | 'none'>('none');
  const spread =
    bestAskPrice !== undefined &&
    bestBidPrice !== undefined &&
    (BigInt(bestAskPrice) - BigInt(bestBidPrice)).toString();

  if (previousPrice !== currentPrice) {
    priceChangeRef.current =
      Number(previousPrice) > Number(currentPrice) ? 'down' : 'up';
  }

  return (
    <div className="flex py-[1px]">
      <div
        className={cn('flex grow items-center justify-center text-base gap-2', {
          'bg-surface-1':
            isMarketInAuction &&
            bestAskPrice &&
            bestBidPrice &&
            BigInt(bestAskPrice) < BigInt(bestBidPrice),
        })}
      >
        {priceChangeRef.current !== 'none' && (
          <span
            className={cn('flex flex-col justify-center', {
              'text-dir-up-fg': priceChangeRef.current === 'up',
              'text-dir-down-fg': priceChangeRef.current === 'down',
            })}
          >
            <VegaIcon
              name={
                priceChangeRef.current === 'up'
                  ? VegaIconNames.ARROW_UP
                  : VegaIconNames.ARROW_DOWN
              }
            />
          </span>
        )}
        <span
          // monospace sizing doesn't quite align with alpha
          className="font-mono text-[15px]"
          data-testid="current-price"
          title={
            isMarketInAuction
              ? t('Estimated uncrossing price')
              : t('Last traded price')
          }
        >
          {addDecimalsFormatNumber(lastTradedPrice, decimalPlaces)}
        </span>
        <span>{assetSymbol}</span>
        {spread && !spread.startsWith('-') && (
          <span
            title={t('Spread')}
            className="font-mono text-xs text-surface-0-fg-muted"
            data-testid="spread"
          >
            ({addDecimalsFormatNumber(spread, decimalPlaces)})
          </span>
        )}
        {isMarketInAuction && (
          <Tooltip
            description={t(
              'Market is in auction. Crossed orders are highlighted on the book, currently estimated to uncross at {{price}}',
              {
                price: addDecimalsFormatNumber(lastTradedPrice, decimalPlaces),
              }
            )}
          >
            <span className="flex items-center justify-center">
              <VegaIcon name={VegaIconNames.HAMMER} />
            </span>
          </Tooltip>
        )}
      </div>
    </div>
  );
};

interface OrderbookProps {
  decimalPlaces: number;
  positionDecimalPlaces: number;
  onClick: (args: { price?: string; size?: string }) => void;
  lastTradedPrice: string;
  bids: PriceLevel[];
  asks: PriceLevel[];
  assetSymbol: string;
  indicativePrice: string;
  isMarketInAuction: boolean;
}

export const Orderbook = ({
  decimalPlaces,
  positionDecimalPlaces,
  onClick,
  lastTradedPrice,
  asks,
  bids,
  assetSymbol,
  isMarketInAuction,
  indicativePrice,
}: OrderbookProps) => {
  const t = useT();
  const [resolution, setResolution] = useState(1);
  const groupedAsks = useMemo(() => {
    return compactRows(asks, VolumeType.ask, resolution);
  }, [asks, resolution]);

  const groupedBids = useMemo(() => {
    return compactRows(bids, VolumeType.bid, resolution);
  }, [bids, resolution]);

  // get the best bid/ask, note that we are using the pre aggregated
  // values so we can render the most accurate spread in the mid section
  const bestAskPrice = asks[0]?.price;
  const bestBidPrice = bids[0]?.price;

  // we'll want to only display a relevant number of dps based on the
  // current resolution selection
  const priceFormatDecimalPlaces = Math.ceil(
    decimalPlaces - Math.log10(resolution)
  );

  return (
    <div className="h-full text-xs grid grid-rows-[1fr_min-content] overflow-hidden">
      <div>
        <ReactVirtualizedAutoSizer>
          {({ width, height }) => {
            const limit = Math.max(
              1,
              Math.floor((height - midHeight) / 2 / (rowHeight + rowGap))
            );
            const askRows = groupedAsks.slice(limit * -1);
            const bidRows = groupedBids.slice(0, limit);

            // this is used for providing a scale to render the volume
            // bars based on the visible book
            const deepestVisibleAsk = askRows[0];
            const deepestVisibleBid = bidRows[bidRows.length - 1];
            const maxVol = Math.max(
              deepestVisibleAsk?.cumulativeVol || 0,
              deepestVisibleBid?.cumulativeVol || 0
            );
            return (
              <div
                className="overflow-hidden grid relative"
                data-testid="orderbook-grid-element"
                style={{
                  width,
                  height,
                  gridTemplateRows: `1fr ${midHeight}px 1fr`, // cannot use tailwind here as tailwind will not parse a class string with interpolation
                }}
              >
                {askRows.length || bidRows.length ? (
                  <>
                    <OrderbookSide
                      rows={askRows}
                      type={VolumeType.ask}
                      decimalPlaces={decimalPlaces}
                      positionDecimalPlaces={positionDecimalPlaces}
                      priceFormatDecimalPlaces={priceFormatDecimalPlaces}
                      onClick={onClick}
                      width={width}
                      maxVol={maxVol}
                      bestAskPrice={askRows[askRows.length - 1]?.price}
                      bestBidPrice={bidRows[0]?.price}
                    />
                    <OrderbookMid
                      lastTradedPrice={lastTradedPrice}
                      decimalPlaces={decimalPlaces}
                      assetSymbol={assetSymbol}
                      bestAskPrice={bestAskPrice}
                      bestBidPrice={bestBidPrice}
                      indicativePrice={indicativePrice}
                      isMarketInAuction={isMarketInAuction}
                    />
                    <OrderbookSide
                      rows={bidRows}
                      type={VolumeType.bid}
                      decimalPlaces={decimalPlaces}
                      positionDecimalPlaces={positionDecimalPlaces}
                      priceFormatDecimalPlaces={priceFormatDecimalPlaces}
                      onClick={onClick}
                      width={width}
                      maxVol={maxVol}
                      bestAskPrice={askRows[askRows.length - 1]?.price}
                      bestBidPrice={bidRows[0]?.price}
                    />
                  </>
                ) : (
                  <div className="absolute inset-0">
                    <Splash>{t('No open orders')}</Splash>
                  </div>
                )}
              </div>
            );
          }}
        </ReactVirtualizedAutoSizer>
      </div>
      <div className="border-t border-gs-300 dark:border-gs-700">
        <OrderbookControls
          lastTradedPrice={lastTradedPrice}
          resolution={resolution}
          decimalPlaces={decimalPlaces}
          setResolution={setResolution}
        />
      </div>
    </div>
  );
};

export default Orderbook;
