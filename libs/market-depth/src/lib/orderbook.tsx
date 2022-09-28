import styles from './orderbook.module.scss';
import colors from 'tailwindcss/colors';

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
  useContext,
} from 'react';
import classNames from 'classnames';

import {
  formatNumber,
  t,
  ThemeContext,
  useResizeObserver,
} from '@vegaprotocol/react-helpers';
import { MarketTradingMode } from '@vegaprotocol/types';
import { OrderbookRow } from './orderbook-row';
import { createRow, getPriceLevel } from './orderbook-data';
import { Icon, Splash } from '@vegaprotocol/ui-toolkit';
import type { OrderbookData, OrderbookRowData } from './orderbook-data';

interface OrderbookProps extends OrderbookData {
  decimalPlaces: number;
  positionDecimalPlaces: number;
  resolution: number;
  onResolutionChange: (resolution: number) => void;
}

const HorizontalLine = ({ top, testId }: { top: string; testId: string }) => (
  <div
    className="absolute border-b border-default inset-x-0"
    style={{ top }}
    data-testid={testId}
  />
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

// 17px of row height plus 5px gap
export const rowHeight = 22;
// buffer size in rows
const bufferSize = 30;
// margin size in px, when reached scrollOffset will be updated
const marginSize = bufferSize * 0.9 * rowHeight;

export const Orderbook = ({
  rows,
  bestStaticBidPrice,
  bestStaticOfferPrice,
  marketTradingMode,
  indicativeVolume,
  indicativePrice,
  decimalPlaces,
  positionDecimalPlaces,
  resolution,
  onResolutionChange,
}: OrderbookProps) => {
  const theme = useContext(ThemeContext);
  const scrollElement = useRef<HTMLDivElement>(null);
  const gridElement = useRef<HTMLDivElement>(null);
  const headerElement = useRef<HTMLDivElement>(null);
  const footerElement = useRef<HTMLDivElement>(null);
  // scroll offset for which rendered rows are selected, will change after user will scroll to margin of rendered data
  const [scrollOffset, setScrollOffset] = useState(0);
  // actual scrollTop of scrollElement current element
  const scrollTopRef = useRef(0);
  // price level which is rendered in center of viewport, need to preserve price level when rows will be added or removed
  // if undefined then we render mid price in center
  const priceInCenter = useRef<string>();
  const [lockOnMidPrice, setLockOnMidPrice] = useState(true);
  const resolutionRef = useRef(resolution);
  // stores rows[0].price value
  const [maxPriceLevel, setMaxPriceLevel] = useState('');
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
  const numberOfRows = useMemo(
    () => getNumberOfRows(rows, resolution),
    [rows, resolution]
  );

  const updateScrollOffset = useCallback(
    (scrollTop: number) => {
      if (Math.abs(scrollOffset - scrollTop) > marginSize) {
        setScrollOffset(scrollTop);
      }
    },
    [scrollOffset]
  );

  const onScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop } = event.currentTarget;
      updateScrollOffset(scrollTop);
      if (scrollTop === scrollTopRef.current) {
        return;
      }
      priceInCenter.current = (
        BigInt(resolution) + // extra row on very top - sticky header
        BigInt(maxPriceLevel) -
        BigInt(
          Math.floor((scrollTop + Math.floor(viewportHeight / 2)) / rowHeight)
        ) *
          BigInt(resolution)
      ).toString();
      if (lockOnMidPrice) {
        setLockOnMidPrice(false);
      }
      scrollTopRef.current = scrollTop;
    },
    [
      resolution,
      lockOnMidPrice,
      maxPriceLevel,
      viewportHeight,
      updateScrollOffset,
    ]
  );

  const scrollToPrice = useCallback(
    (price: string) => {
      if (scrollElement.current && maxPriceLevel) {
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
        scrollTop +=
          (scrollTopRef.current % rowHeight) - (scrollTop % rowHeight);
        const priceCenterScrollOffset = Math.max(
          0,
          Math.min(scrollTop, numberOfRows * rowHeight - viewportHeight)
        );
        if (scrollTopRef.current !== priceCenterScrollOffset) {
          updateScrollOffset(priceCenterScrollOffset);
          scrollTopRef.current = priceCenterScrollOffset;
          scrollElement.current.scrollTop = priceCenterScrollOffset;
        }
      }
    },
    [
      maxPriceLevel,
      resolution,
      viewportHeight,
      numberOfRows,
      updateScrollOffset,
    ]
  );

  useEffect(() => {
    const newMaxPriceLevel = rows?.[0]?.price ?? '';
    if (newMaxPriceLevel !== maxPriceLevel) {
      setMaxPriceLevel(newMaxPriceLevel);
    }
  }, [rows, maxPriceLevel]);

  const scrollToMidPrice = useCallback(() => {
    if (!bestStaticOfferPrice || !bestStaticBidPrice) {
      return;
    }
    priceInCenter.current = undefined;
    let midPrice = getPriceLevel(
      BigInt(bestStaticOfferPrice) +
        (BigInt(bestStaticBidPrice) - BigInt(bestStaticOfferPrice)) / BigInt(2),
      resolution
    );
    if (BigInt(midPrice) > BigInt(maxPriceLevel)) {
      midPrice = maxPriceLevel;
    } else {
      const minPriceLevel =
        BigInt(maxPriceLevel) - BigInt(Math.floor(numberOfRows * resolution));
      if (BigInt(midPrice) < minPriceLevel) {
        midPrice = minPriceLevel.toString();
      }
    }
    scrollToPrice(midPrice);
    setLockOnMidPrice(true);
  }, [
    bestStaticOfferPrice,
    bestStaticBidPrice,
    scrollToPrice,
    resolution,
    maxPriceLevel,
    numberOfRows,
  ]);

  // adjust scroll position to keep selected price in center
  useLayoutEffect(() => {
    if (resolutionRef.current !== resolution) {
      priceInCenter.current = undefined;
      resolutionRef.current = resolution;
    }
    if (priceInCenter.current) {
      scrollToPrice(priceInCenter.current);
    } else {
      scrollToMidPrice();
    }
  }, [scrollToMidPrice, scrollToPrice, resolution]);

  // handles window resize
  useEffect(() => {
    function handleResize() {
      if (scrollElement.current) {
        setViewportHeight(
          scrollElement.current.clientHeight || window.innerHeight
        );
      }
    }
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  // sets the correct width of header and footer
  useLayoutEffect(() => {
    if (
      !gridElement.current ||
      !headerElement.current ||
      !footerElement.current
    ) {
      return;
    }
    const gridWidth = gridElement.current.clientWidth;
    headerElement.current.style.width = `${gridWidth}px`;
    footerElement.current.style.width = `${gridWidth}px`;
  }, [headerElement, footerElement, gridElement]);
  // handles resizing of the Allotment.Pane (x-axis)
  // adjusts the header and footer width
  const gridResizeHandler: ResizeObserverCallback = useCallback(
    (entries) => {
      if (
        !headerElement.current ||
        !footerElement.current ||
        entries.length === 0
      ) {
        return;
      }
      const {
        contentRect: { width, height },
      } = entries[0];
      headerElement.current.style.width = `${width}px`;
      footerElement.current.style.width = `${width}px`;
      setViewportHeight(height);
    },
    [headerElement, footerElement]
  );
  // handles resizing of the Allotment.Pane (y-axis)
  // adjusts the scroll height
  const scrollElementResizeHandler: ResizeObserverCallback = useCallback(
    (entries) => {
      if (!scrollElement.current || entries.length === 0) return;
      setViewportHeight(entries[0].contentRect.height);
    },
    [setViewportHeight, scrollElement]
  );
  useResizeObserver(gridElement.current, gridResizeHandler);
  useResizeObserver(scrollElement.current, scrollElementResizeHandler);

  let offset = Math.max(0, Math.round(scrollOffset / rowHeight));
  const prependingBufferSize = Math.min(bufferSize, offset);
  offset -= prependingBufferSize;
  const viewportSize = Math.round(viewportHeight / rowHeight);
  const limit = Math.min(
    prependingBufferSize + viewportSize + bufferSize,
    numberOfRows - offset
  );
  const data = getRowsToRender(rows, resolution, offset, limit);

  const paddingTop = offset * rowHeight;
  const paddingBottom = (numberOfRows - offset - limit) * rowHeight;
  const minPriceLevel =
    BigInt(maxPriceLevel) - BigInt(Math.floor(numberOfRows * resolution));
  const tableBody =
    data && data.length !== 0 ? (
      <div
        className="grid grid-cols-4 gap-[0.3125rem] text-right"
        style={{
          gridAutoRows: '17px',
        }}
      >
        {data.map((data, i) => (
          <OrderbookRow
            key={data.price}
            price={(BigInt(data.price) / BigInt(resolution)).toString()}
            decimalPlaces={decimalPlaces - Math.log10(resolution)}
            positionDecimalPlaces={positionDecimalPlaces}
            bid={data.bid}
            relativeBid={data.relativeBid}
            cumulativeBid={data.cumulativeVol.bid}
            cumulativeRelativeBid={data.cumulativeVol.relativeBid}
            ask={data.ask}
            relativeAsk={data.relativeAsk}
            cumulativeAsk={data.cumulativeVol.ask}
            cumulativeRelativeAsk={data.cumulativeVol.relativeAsk}
            indicativeVolume={
              marketTradingMode !== MarketTradingMode.TRADING_MODE_CONTINUOUS &&
              indicativePrice === data.price
                ? indicativeVolume
                : undefined
            }
          />
        ))}
      </div>
    ) : null;

  const c = theme === 'dark' ? colors.neutral[600] : colors.neutral[300];
  const gradientStyles = `linear-gradient(${c},${c}) 24.6% 0/1px 100% no-repeat, linear-gradient(${c},${c}) 50% 0/1px 100% no-repeat, linear-gradient(${c},${c}) 75.2% 0/1px 100% no-repeat`;

  const resolutions = new Array(decimalPlaces + 1)
    .fill(null)
    .map((v, i) => Math.pow(10, i));

  return (
    <div className="h-full relative pl-2 text-xs">
      <div
        className="absolute top-0 grid grid-cols-4 gap-2 text-right border-b pt-2 bg-white dark:bg-black z-10 border-default w-full"
        style={{ gridAutoRows: '17px' }}
        ref={headerElement}
      >
        <div>{t('Bid vol')}</div>
        <div>{t('Price')}</div>
        <div>{t('Ask vol')}</div>
        <div className="pr-[2px]">{t('Cumulative vol')}</div>
      </div>
      <div
        className={`h-full overflow-auto relative ${styles['scroll']} pt-[26px] pb-[17px]`}
        onScroll={onScroll}
        ref={scrollElement}
        data-testid="scroll"
      >
        <div
          className="relative text-right min-h-full"
          style={{
            paddingTop: `${paddingTop}px`,
            paddingBottom: `${paddingBottom}px`,
            background: tableBody ? gradientStyles : 'none',
          }}
          ref={gridElement}
        >
          {tableBody || (
            <div className="inset-0 absolute">
              <Splash>{t('No data')}</Splash>
            </div>
          )}
        </div>
        {maxPriceLevel &&
          bestStaticBidPrice &&
          BigInt(bestStaticBidPrice) < BigInt(maxPriceLevel) &&
          BigInt(bestStaticBidPrice) > minPriceLevel && (
            <HorizontalLine
              top={`${(
                ((BigInt(maxPriceLevel) - BigInt(bestStaticBidPrice)) /
                  BigInt(resolution) +
                  BigInt(1)) *
                  BigInt(rowHeight) +
                BigInt(1)
              ).toString()}px`}
              testId="best-static-bid-price"
            />
          )}
        {maxPriceLevel &&
          bestStaticOfferPrice &&
          BigInt(bestStaticOfferPrice) <= BigInt(maxPriceLevel) &&
          BigInt(bestStaticOfferPrice) > minPriceLevel && (
            <HorizontalLine
              top={`${(
                ((BigInt(maxPriceLevel) - BigInt(bestStaticOfferPrice)) /
                  BigInt(resolution) +
                  BigInt(2)) *
                  BigInt(rowHeight) +
                BigInt(1)
              ).toString()}px`}
              testId={'best-static-offer-price'}
            />
          )}
      </div>
      <div
        className="absolute bottom-0 grid grid-cols-4 gap-2 border-t-[1px] border-default mt-2 z-10 bg-white dark:bg-black w-full"
        style={{ gridAutoRows: '17px' }}
        ref={footerElement}
      >
        <div className="col-start-2">
          <select
            onChange={(e) => onResolutionChange(Number(e.currentTarget.value))}
            value={resolution}
            className="block bg-neutral-100 dark:bg-neutral-700 font-mono text-right w-full h-full"
            data-testid="resolution"
          >
            {resolutions.map((r) => (
              <option key={r} value={r}>
                {formatNumber(0, decimalPlaces - Math.log10(r))}
              </option>
            ))}
          </select>
        </div>
        <div className="col-start-4">
          <button
            onClick={scrollToMidPrice}
            className={classNames('w-full h-full', {
              hidden: lockOnMidPrice,
              block: !lockOnMidPrice,
            })}
            data-testid="scroll-to-midprice"
          >
            Go to mid
            <span className="ml-4">
              <Icon name="th-derived" />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Orderbook;
