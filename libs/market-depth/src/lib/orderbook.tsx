import styles from './orderbook.module.scss';

import {
  Fragment,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from 'react';
import { formatNumber, t } from '@vegaprotocol/react-helpers';
import { MarketTradingMode } from '@vegaprotocol/types';
import { OrderbookRow } from './orderbook-row';
import { createRow, getPriceLevel } from './orderbook-data';
import { Icon } from '@vegaprotocol/ui-toolkit';
import type { OrderbookData, OrderbookRowData } from './orderbook-data';
interface OrderbookProps extends OrderbookData {
  decimalPlaces: number;
  resolution: number;
  onResolutionChange: (resolution: number) => void;
}

const horizontalLine = (top: string, testId: string) => (
  <div
    className="border-b-1 absolute inset-x-0"
    style={{ top }}
    data-testid={testId}
  ></div>
);

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
      resolution +
    1
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
    rows.findIndex((row) => BigInt(row.price) <= price) - 1,
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
  // scroll offset for which rendered rows are selected, will change after user will scroll to margin of rendered data
  const [scrollOffset, setScrollOffset] = useState(0);
  // price level which is rendered in center of vieport, need to preserve price level when rows will be added or removed
  const priceInCenter = useRef('');
  const [lockOnMidPrice, setLockOnMidPrice] = useState(true);
  const resolutionRef = useRef(resolution);
  const skipPriceInCenterUpdateRef = useRef(false);
  // stores rows[0].price value
  const [maxPriceLevel, setMaxPriceLevel] = useState('');
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
  // 17px of row height plus 4px gap
  const rowHeight = 21;
  // buffer size in rows
  const bufferSize = 30;
  // margin size in px, when reached scrollOffset will be updated
  const marginSize = bufferSize * 0.9 * rowHeight;
  const numberOfRows = useMemo(
    () => getNumberOfRows(rows, resolution),
    [rows, resolution]
  );

  const scrollToPrice = useCallback(
    (price: string, skipPriceInCenterUpdate = false) => {
      if (scrollRef.current && maxPriceLevel) {
        let scrollTop =
          // distance in rows between midPrice and price from first row * row Height
          (Number(
            (BigInt(maxPriceLevel) - BigInt(price)) / BigInt(resolution)
          ) +
            1) * // add one row for sticky header
          rowHeight;
        // minus half height of viewport plus half of row
        scrollTop -= Math.ceil((viewportHeight - rowHeight) / 2);
        // adjust to current rows position
        scrollTop += (scrollRef.current.scrollTop % 21) - (scrollTop % 21);
        const priceCenterScrollOffset = Math.max(0, Math.min(scrollTop));
        if (scrollRef.current.scrollTop !== priceCenterScrollOffset) {
          scrollRef.current.scrollTop = priceCenterScrollOffset;
          skipPriceInCenterUpdateRef.current = skipPriceInCenterUpdate;
        }
      }
    },
    [maxPriceLevel, resolution, viewportHeight]
  );

  useEffect(() => {
    const newMaxPriceLevel = rows?.[0]?.price ?? '';
    if (newMaxPriceLevel !== maxPriceLevel) {
      setMaxPriceLevel(newMaxPriceLevel);
    }
  }, [rows, maxPriceLevel]);

  const scrollToMidPrice = useCallback(() => {
    if (!bestStaticOfferPrice || !bestStaticBidPrice /*|| !maxPriceLevel*/) {
      return;
    }
    setLockOnMidPrice(true);
    priceInCenter.current = '';
    scrollToPrice(
      getPriceLevel(
        BigInt(bestStaticOfferPrice) +
          (BigInt(bestStaticBidPrice) - BigInt(bestStaticOfferPrice)) /
            BigInt(2),
        resolution
      ),
      true
    );
  }, [bestStaticOfferPrice, bestStaticBidPrice, scrollToPrice, resolution]);

  useLayoutEffect(() => {
    if (resolutionRef.current !== resolution) {
      priceInCenter.current = '';
      resolutionRef.current = resolution;
      setLockOnMidPrice(true);
    }
    if (priceInCenter.current) {
      scrollToPrice(priceInCenter.current);
    } else {
      scrollToMidPrice();
    }
  }, [scrollToMidPrice, scrollToPrice, resolution]);

  useEffect(() => {
    function handleResize() {
      if (scrollRef.current) {
        setViewportHeight(scrollRef.current.clientHeight);
      }
    }
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const renderedRows = useMemo(() => {
    let offset = Math.max(0, Math.round(scrollOffset / rowHeight));
    const prependingBufferSize = Math.min(bufferSize, offset);
    offset -= prependingBufferSize;
    const viewportSize = Math.round(viewportHeight / rowHeight);
    const limit = Math.min(
      prependingBufferSize + viewportSize + bufferSize,
      numberOfRows - offset
    );
    return {
      offset,
      limit,
      data: getRowsToRender(rows, resolution, offset, limit),
    };
  }, [rows, scrollOffset, resolution, viewportHeight, numberOfRows]);

  const onScroll = (event: React.UIEvent<HTMLDivElement>) => {
    if (Math.abs(scrollOffset - event.currentTarget.scrollTop) > marginSize) {
      setScrollOffset(event.currentTarget.scrollTop);
    }
    if (skipPriceInCenterUpdateRef.current) {
      skipPriceInCenterUpdateRef.current = false;
      return;
    }
    priceInCenter.current = (
      BigInt(resolution) + // extra row on very top - sticky header
      BigInt(rows?.[0]?.price ?? 0) -
      BigInt(
        Math.floor(
          (event.currentTarget.scrollTop + Math.floor(viewportHeight / 2)) /
            rowHeight /
            resolution
        )
      ) *
        BigInt(resolution)
    ).toString();
    if (lockOnMidPrice) {
      setLockOnMidPrice(false);
    }
  };

  const paddingTop = renderedRows.offset * rowHeight;
  const paddingBottom =
    (numberOfRows - renderedRows.offset - renderedRows.limit) * rowHeight;

  return (
    <div
      className={`h-full overflow-auto relative ${styles['scroll']}`}
      style={{ scrollbarColor: 'rebeccapurple green', scrollbarWidth: 'thin' }}
      onScroll={onScroll}
      ref={scrollRef}
    >
      <div className="sticky top-0 grid grid-cols-4 gap-4 border-b-1 text-ui-small mb-2 pb-2 bg-white dark:bg-black z-10" style={{ gridAutoRows: '17px' }}>
        <div className="pl-4">{t('Bid Vol')}</div>
        <div>{t('Price')}</div>
        <div>{t('Ask Vol')}</div>
        <div>{t('Cumulative Vol')}</div>
      </div>
      <div
        style={{
          paddingTop: `${paddingTop}px`,
          paddingBottom: `${paddingBottom}px`,
          minHeight: `calc(100% - ${2 * rowHeight}px)`,
        }}
      >
        <div className="grid grid-cols-4 gap-4 text-right text-ui-small" style={{ gridAutoRows: '17px' }}>
          {renderedRows.data?.map((data) => {
            return (
              <Fragment key={data.price}>
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
              </Fragment>
            );
          })}
        </div>
      </div>
      <div className="sticky bottom-0 grid grid-cols-4 gap-4 border-t-1 text-ui-small mt-2 pb-2 bg-white dark:bg-black z-10" style={{ gridAutoRows: '17px' }}>
        <div className="text-ui-small col-start-2">
          <select
            onChange={(e) => onResolutionChange(Number(e.target.value))}
            value={resolution}
            className="block bg-black-25 dark:bg-white-25 text-black dark:text-white focus-visible:shadow-focus dark:focus-visible:shadow-focus-dark focus-visible:outline-0 font-mono w-100 text-right w-full appearance-none"
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
        <div className="text-ui-small col-start-4">
          <button onClick={scrollToMidPrice} className="block w-full">
            mid price{' '}
            <span className={lockOnMidPrice ? 'text-yellow' : ''}>
              <Icon name="th-derived" />
            </span>
          </button>
        </div>
      </div>
      {maxPriceLevel &&
        bestStaticBidPrice &&
        horizontalLine(
          `${(
            ((BigInt(maxPriceLevel) - BigInt(bestStaticBidPrice)) /
              BigInt(resolution) +
              BigInt(1)) *
              BigInt(rowHeight) -
            BigInt(3)
          ).toString()}px`,
          'best-static-bid-price'
        )}
      {maxPriceLevel &&
        bestStaticOfferPrice &&
        horizontalLine(
          `${(
            ((BigInt(maxPriceLevel) - BigInt(bestStaticOfferPrice)) /
              BigInt(resolution) +
              BigInt(2)) *
              BigInt(rowHeight) -
            BigInt(3)
          ).toString()}px`,
          'best-static-offer-price'
        )}
    </div>
  );
};

export default Orderbook;
