import { Fragment, useEffect, useRef, useState, useMemo } from 'react';
import { formatNumber, t } from '@vegaprotocol/react-helpers';
import { MarketTradingMode } from '@vegaprotocol/types';
import { OrderbookRow } from './orderbook-row';
import { createRow, getPriceLevel } from './orderbook-data';
import type { OrderbookData, OrderbookRowData } from './orderbook-data';
interface OrderbookProps extends OrderbookData {
  decimalPlaces: number;
  resolution: number;
  onResolutionChange: (resolution: number) => void;
}

const horizontalLine = () => <div className="col-span-full border-b-1"></div>;

const getNumberOfRows = (
  rows: OrderbookRowData[] | null,
  resolution: number
) => {
  if (!rows || !rows.length) {
    return 0;
  }
  if (rows.length === 1) {
    return 1;
  }
  return (
    Number(BigInt(rows[0].price) - BigInt(rows[rows.length - 1].price)) /
    resolution
  );
};

const getRowsToRender = (
  rows: OrderbookRowData[] | null,
  resolution: number,
  offset: number,
  limit: number
): OrderbookRowData[] | null => {
  if (!rows || !rows.length) {
    return rows;
  }
  if (rows.length === 1) {
    return rows;
  }
  const selectedRows: OrderbookRowData[] = [];
  let price = BigInt(rows[0].price) - BigInt(offset * resolution);
  let index = Math.max(
    rows.findIndex((row) => BigInt(row.price) < price) - 1,
    -1
  );
  while (selectedRows.length < limit && index + 1 < rows.length) {
    if (rows[index + 1].price === price.toString()) {
      selectedRows.push(rows[index + 1]);
      index += 1;
    } else {
      const row = createRow(price.toString());
      row.cumulativeVol = {
        bid: rows[index].cumulativeVol.bid,
        relativeBid: rows[index].cumulativeVol.relativeBid,
        ask: rows[index + 1].cumulativeVol.ask,
        relativeAsk: rows[index + 1].cumulativeVol.relativeAsk,
      };
      selectedRows.push(row);
    }
    price -= BigInt(resolution);
  }
  return selectedRows;
};

export const Orderbook = ({
  rows,
  bestStaticBidPrice,
  bestStaticOfferPrice,
  marketTradingMode,
  indicativeVolume,
  indicativePrice,
  decimalPlaces,
  resolution,
  onResolutionChange,
}: OrderbookProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(1000);
  const rowHeight = 21;
  const bufferSize = 30;
  const marginSize = bufferSize * 0.9 * rowHeight;
  const numberOfRows = useMemo(
    () => getNumberOfRows(rows, resolution),
    [rows, resolution]
  );
  useEffect(() => {
    //scrollToMiddle
    if (!bestStaticOfferPrice || !bestStaticBidPrice || !rows || !rows.length) {
      return;
    }
    const midPrice = getPriceLevel(
      BigInt(bestStaticOfferPrice) +
        (BigInt(bestStaticBidPrice) - BigInt(bestStaticOfferPrice)) / BigInt(2),
      resolution
    );
    const midPriceCenterScrollOffset = Math.max(
      0,
      Math.min(
        Number(
          (BigInt(rows?.[0].price) - BigInt(midPrice)) / BigInt(resolution)
        ) *
          rowHeight -
          bufferSize,
        numberOfRows * rowHeight - viewportHeight
      )
    );
    setScrollOffset(midPriceCenterScrollOffset);
    if (scrollRef.current) {
      scrollRef.current.scrollTop = midPriceCenterScrollOffset;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolution]);
  useEffect(() => {
    if (scrollRef.current) {
      setViewportHeight(scrollRef.current.clientHeight);
    }
  }, []);
  const renderedRows = useMemo(() => {
    let offset = Math.max(0, Math.round(scrollOffset / rowHeight));
    const prependingBufferSize = Math.min(bufferSize, offset);
    // console.log('op', offset, prependingBufferSize);
    offset -= prependingBufferSize;
    const viewportSize = Math.round(viewportHeight / rowHeight);
    const limit = Math.min(
      prependingBufferSize + viewportSize + bufferSize,
      numberOfRows - offset
    );
    // console.log('getRowsToRender', viewportSize, offset, limit);
    return {
      offset,
      limit,
      data: getRowsToRender(rows, resolution, offset, limit),
    };
  }, [rows, scrollOffset, resolution, viewportHeight, numberOfRows]);
  const onScroll = (event: React.UIEvent<HTMLDivElement>) => {
    // const containerHeight = event.currentTarget.clientHeight;
    // const scrollHeight = event.currentTarget.scrollHeight;
    console.log(
      'onScroll',
      Math.abs(scrollOffset - event.currentTarget.scrollTop)
    );
    if (Math.abs(scrollOffset - event.currentTarget.scrollTop) > marginSize) {
      console.log('setScrollOffset');
      setScrollOffset(event.currentTarget.scrollTop);
    }
  };
  const paddingTop = renderedRows.offset * rowHeight;
  const paddingBottom =
    (numberOfRows - renderedRows.offset - renderedRows.limit) * rowHeight;
  return (
    <div
      className="h-full overflow-auto relative"
      onScroll={onScroll}
      ref={scrollRef}
    >
      <div className="sticky top-0 grid grid-cols-4 gap-4 border-b-1 text-ui-small mb-2 pb-2 bg-white dark:bg-black z-10">
        <div>{t('Bid Vol')}</div>
        <div>{t('Price')}</div>
        <div>{t('Ask Vol')}</div>
        <div>{t('Cumulative Vol')}</div>
      </div>
      <div
        style={{
          paddingTop: `${paddingTop}px`,
          paddingBottom: `${paddingBottom}px`,
        }}
      >
        <div className="grid grid-cols-4 gap-4 text-right text-ui-small">
          {renderedRows.data?.map((data) => {
            return (
              <Fragment key={data.price}>
                {bestStaticBidPrice === data.price ? horizontalLine() : null}
                <OrderbookRow
                  price={(BigInt(data.price) / BigInt(resolution)).toString()}
                  decimalPlaces={decimalPlaces - Math.log10(resolution)}
                  bid={data.bid}
                  relativeBid={data.relativeBid}
                  cumulativeBid={data.cumulativeVol.bid}
                  cumulativeRelativeBid={data.cumulativeVol.relativeBid}
                  ask={data.ask}
                  relativeAsk={data.relativeAsk}
                  cumulativeAsk={data.cumulativeVol.ask}
                  cumulativeRelativeAsk={data.cumulativeVol.relativeAsk}
                  indicativeVolume={
                    marketTradingMode !== MarketTradingMode.Continuous &&
                    indicativePrice === data.price
                      ? indicativeVolume
                      : undefined
                  }
                />
                {bestStaticOfferPrice === data.price &&
                bestStaticOfferPrice !== bestStaticBidPrice
                  ? horizontalLine()
                  : null}
              </Fragment>
            );
          })}
        </div>
      </div>
      <div className="sticky bottom-0 grid grid-cols-4 gap-4 border-t-1 text-ui-small mt-2 pb-2 bg-white dark:bg-black z-10">
        <div className="text-ui-small col-start-2">
          <select
            onChange={(e) => onResolutionChange(Number(e.target.value))}
            value={resolution}
            className="bg-black-25 dark:bg-white-25 text-black dark:text-white focus-visible:shadow-focus dark:focus-visible:shadow-focus-dark focus-visible:outline-0 font-mono w-100 text-right w-full appearance-none"
          >
            {new Array(3)
              .fill(null)
              .map((v, i) => Math.pow(10, i))
              .map((r) => (
                <option key={r} value={r}>
                  {formatNumber(0, decimalPlaces - Math.log10(r))}
                </option>
              ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default Orderbook;
