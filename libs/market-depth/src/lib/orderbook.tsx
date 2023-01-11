import styles from './orderbook.module.scss';
import colors from 'tailwindcss/colors';

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
  Fragment,
} from 'react';
import classNames from 'classnames';

import {
  addDecimalsFixedFormatNumber,
  t,
  useResizeObserver,
  formatNumberFixed,
  useThemeSwitcher,
} from '@vegaprotocol/react-helpers';
import * as Schema from '@vegaprotocol/types';
import { OrderbookRow } from './orderbook-row';
import { createRow, getPriceLevel } from './orderbook-data';
import { Icon, Splash } from '@vegaprotocol/ui-toolkit';
import type { OrderbookData, OrderbookRowData } from './orderbook-data';

interface OrderbookProps extends OrderbookData {
  decimalPlaces: number;
  positionDecimalPlaces: number;
  resolution: number;
  onResolutionChange: (resolution: number) => void;
  fillGaps?: boolean;
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

const getBestStaticBidPriceLinePosition = (
  bestStaticBidPrice: string | undefined,
  fillGaps: boolean,
  maxPriceLevel: string,
  minPriceLevel: string,
  resolution: number,
  rows: OrderbookRowData[] | null
) => {
  let bestStaticBidPriceLinePosition = '';
  if (maxPriceLevel !== '0' && minPriceLevel !== '0') {
    if (
      bestStaticBidPrice &&
      BigInt(bestStaticBidPrice) < BigInt(maxPriceLevel) &&
      BigInt(bestStaticBidPrice) > BigInt(minPriceLevel)
    ) {
      if (fillGaps) {
        bestStaticBidPriceLinePosition = (
          ((BigInt(maxPriceLevel) - BigInt(bestStaticBidPrice)) /
            BigInt(resolution) +
            BigInt(1)) *
            BigInt(rowHeight) +
          BigInt(1)
        ).toString();
      } else {
        const index = rows?.findIndex(
          (row) => BigInt(row.price) <= BigInt(bestStaticBidPrice)
        );
        if (index !== undefined && index !== -1) {
          bestStaticBidPriceLinePosition = (
            (index + 1) * rowHeight +
            1
          ).toString();
        }
      }
    }
  }
  return bestStaticBidPriceLinePosition;
};
const getBestStaticOfferPriceLinePosition = (
  bestStaticOfferPrice: string | undefined,
  fillGaps: boolean,
  maxPriceLevel: string,
  minPriceLevel: string,
  resolution: number,
  rows: OrderbookRowData[] | null
) => {
  let bestStaticOfferPriceLinePosition = '';
  if (
    bestStaticOfferPrice &&
    BigInt(bestStaticOfferPrice) <= BigInt(maxPriceLevel) &&
    BigInt(bestStaticOfferPrice) > BigInt(minPriceLevel)
  ) {
    if (fillGaps) {
      bestStaticOfferPriceLinePosition = (
        ((BigInt(maxPriceLevel) - BigInt(bestStaticOfferPrice)) /
          BigInt(resolution) +
          BigInt(2)) *
          BigInt(rowHeight) +
        BigInt(1)
      ).toString();
    } else {
      const index = rows?.findIndex(
        (row) => BigInt(row.price) <= BigInt(bestStaticOfferPrice)
      );
      if (index !== undefined && index !== -1) {
        bestStaticOfferPriceLinePosition = (
          (index + 2) * rowHeight +
          1
        ).toString();
      }
    }
  }
  return bestStaticOfferPriceLinePosition;
};
const OrderbookDebugInfo = ({
  decimalPlaces,
  numberOfRows,
  viewportHeight,
  lockOnMidPrice,
  priceInCenter,
  bestStaticBidPrice,
  bestStaticOfferPrice,
  maxPriceLevel,
  minPriceLevel,
  resolution,
}: {
  decimalPlaces: number;
  numberOfRows: number;
  viewportHeight: number;
  lockOnMidPrice: boolean;
  priceInCenter?: string;
  bestStaticBidPrice?: string;
  bestStaticOfferPrice?: string;
  maxPriceLevel: string;
  minPriceLevel: string;
  resolution: number;
}) => (
  <Fragment>
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '0',
        borderTop: '1px solid rgba(255,0,0,0.5)',
        background: 'black',
        width: '100%',
        transform: 'translateY(-50%)',
      }}
    ></div>
    <div
      className="absolute left-0 bottom-0 font-mono"
      style={{
        fontSize: '10px',
        color: '#FFF',
        background: '#000',
        padding: '2px',
      }}
    >
      <pre>
        {JSON.stringify(
          {
            numberOfRows,
            viewportHeight,
            lockOnMidPrice,
            priceInCenter: priceInCenter
              ? addDecimalsFixedFormatNumber(priceInCenter, decimalPlaces)
              : '-',
            maxPriceLevel: addDecimalsFixedFormatNumber(
              maxPriceLevel ?? '0',
              decimalPlaces
            ),
            bestStaticBidPrice: addDecimalsFixedFormatNumber(
              bestStaticBidPrice ?? '0',
              decimalPlaces
            ),
            bestStaticOfferPrice: addDecimalsFixedFormatNumber(
              bestStaticOfferPrice ?? '0',
              decimalPlaces
            ),
            minPriceLevel: addDecimalsFixedFormatNumber(
              minPriceLevel ?? '0',
              decimalPlaces
            ),
            midPrice: addDecimalsFixedFormatNumber(
              (bestStaticOfferPrice &&
                bestStaticBidPrice &&
                getPriceLevel(
                  BigInt(bestStaticOfferPrice) +
                    (BigInt(bestStaticBidPrice) -
                      BigInt(bestStaticOfferPrice)) /
                      BigInt(2),
                  resolution
                )) ??
                '0',
              decimalPlaces
            ),
          },
          null,
          2
        )}
      </pre>
    </div>
  </Fragment>
);

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
  fillGaps: initialFillGaps,
  onResolutionChange,
}: OrderbookProps) => {
  const { theme } = useThemeSwitcher();
  const scrollElement = useRef<HTMLDivElement>(null);
  const rootElement = useRef<HTMLDivElement>(null);
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
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
  const [fillGaps, setFillGaps] = useState(!!initialFillGaps);
  const numberOfRows = useMemo(
    () => (fillGaps ? getNumberOfRows(rows, resolution) : rows?.length ?? 0),
    [rows, resolution, fillGaps]
  );
  const maxPriceLevel = rows?.[0]?.price ?? '0';
  const minPriceLevel = (
    fillGaps
      ? BigInt(maxPriceLevel) - BigInt(Math.floor(numberOfRows * resolution))
      : BigInt(rows?.[rows.length - 1]?.price ?? '0')
  ).toString();
  const [debug, setDebug] = useState(false);
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
      const offsetTop = Math.floor(
        (scrollTop + Math.floor(viewportHeight / 2)) / rowHeight
      );
      priceInCenter.current = fillGaps
        ? (
            BigInt(resolution) + // extra row on very top - sticky header
            BigInt(maxPriceLevel) -
            BigInt(offsetTop) * BigInt(resolution)
          ).toString()
        : rows?.[Math.min(offsetTop, rows.length - 1)].price.toString();
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
      fillGaps,
      rows,
    ]
  );

  const scrollToPrice = useCallback(
    (price: string) => {
      if (scrollElement.current && maxPriceLevel !== '0') {
        let scrollTop = 0;
        if (fillGaps) {
          scrollTop =
            // distance in rows between given price and first row price * row Height
            (Number(
              (BigInt(maxPriceLevel) - BigInt(price)) / BigInt(resolution)
            ) +
              1) * // add one row for sticky header
              rowHeight +
            rowHeight / 2 -
            (viewportHeight % rowHeight);
        } else if (rows) {
          const index = rows.findIndex(
            (row) => BigInt(row.price) <= BigInt(price)
          );
          if (index !== -1) {
            scrollTop =
              index * rowHeight + rowHeight / 2 - (viewportHeight % rowHeight);
            if (
              price === rows[index].price ||
              index === 0 ||
              BigInt(rows[index].price) - BigInt(price) <
                BigInt(price) - BigInt(rows[index - 1].price)
            ) {
              scrollTop += rowHeight;
            }
          }
        }
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
      fillGaps,
      rows,
    ]
  );

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
      if (BigInt(midPrice) < BigInt(minPriceLevel)) {
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
    minPriceLevel,
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
      if (rootElement.current) {
        setViewportHeight(
          rootElement.current.clientHeight || window.innerHeight
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
        contentRect: { width },
      } = entries[0];
      headerElement.current.style.width = `${width}px`;
      footerElement.current.style.width = `${width}px`;
    },
    [headerElement, footerElement]
  );
  // handles resizing of the Allotment.Pane (y-axis)
  // adjusts the scroll height
  const rootElementResizeHandler: ResizeObserverCallback = useCallback(
    (entries) => {
      if (!rootElement.current || entries.length === 0) {
        return;
      }
      setViewportHeight(entries[0].contentRect.height);
    },
    [setViewportHeight, rootElement]
  );
  useResizeObserver(gridElement.current, gridResizeHandler);
  useResizeObserver(rootElement.current, rootElementResizeHandler);

  let offset = Math.max(0, Math.round(scrollOffset / rowHeight));
  const prependingBufferSize = Math.min(bufferSize, offset);
  offset -= prependingBufferSize;
  const viewportSize = Math.round(viewportHeight / rowHeight);
  const limit = Math.min(
    prependingBufferSize + viewportSize + bufferSize,
    numberOfRows - offset
  );
  const data = fillGaps
    ? getRowsToRender(rows, resolution, offset, limit)
    : rows?.slice(offset, offset + limit) ?? [];

  const paddingTop = offset * rowHeight;
  const paddingBottom = (numberOfRows - offset - limit) * rowHeight;
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
              marketTradingMode !==
                Schema.MarketTradingMode.TRADING_MODE_CONTINUOUS &&
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

  const bestStaticBidPriceLinePosition = getBestStaticBidPriceLinePosition(
    bestStaticBidPrice,
    fillGaps,
    maxPriceLevel,
    minPriceLevel,
    resolution,
    rows
  );

  const bestStaticOfferPriceLinePosition = getBestStaticOfferPriceLinePosition(
    bestStaticOfferPrice,
    fillGaps,
    maxPriceLevel,
    minPriceLevel,
    resolution,
    rows
  );

  /* eslint-disable jsx-a11y/no-static-element-interactions */
  return (
    <div
      className="h-full relative pl-2 text-xs"
      ref={rootElement}
      onDoubleClick={() => setDebug(!debug)}
    >
      <div
        className="absolute top-0 grid grid-cols-4 gap-2 text-right border-b pt-2 bg-white dark:bg-black z-10 border-default w-full"
        style={{ gridAutoRows: '17px' }}
        ref={headerElement}
      >
        <div>{t('Bid vol')}</div>
        <div>{t('Ask vol')}</div>
        <div>{t('Price')}</div>
        <div className="pr-[2px] whitespace-nowrap overflow-hidden text-ellipsis">
          {t('Cumulative vol')}
        </div>
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
            paddingTop: paddingTop,
            paddingBottom: paddingBottom,
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
        {bestStaticBidPriceLinePosition && (
          <HorizontalLine
            top={`${bestStaticBidPriceLinePosition}px`}
            testId="best-static-bid-price"
          />
        )}
        {bestStaticOfferPriceLinePosition && (
          <HorizontalLine
            top={`${bestStaticOfferPriceLinePosition}px`}
            testId={'best-static-offer-price'}
          />
        )}
      </div>
      <div
        className="absolute bottom-0 grid grid-cols-4 gap-2 border-t-[1px] border-default mt-2 z-10 bg-white dark:bg-black w-full"
        style={{ gridAutoRows: '17px' }}
        ref={footerElement}
      >
        <div className="col-span-2">
          <label className="flex items-center whitespace-nowrap overflow-hidden text-ellipsis">
            <input
              className="mr-1"
              type="checkbox"
              checked={fillGaps}
              onChange={() => setFillGaps(!fillGaps)}
            />
            {t('Show prices with no orders')}
          </label>
        </div>
        <div className="col-start-3">
          <select
            onChange={(e) => onResolutionChange(Number(e.currentTarget.value))}
            value={resolution}
            className="block bg-neutral-100 dark:bg-neutral-700 font-mono text-right w-full h-full"
            data-testid="resolution"
          >
            {resolutions.map((r) => (
              <option key={r} value={r}>
                {formatNumberFixed(0, decimalPlaces - Math.log10(r))}
              </option>
            ))}
          </select>
        </div>
        <div className="col-start-4 whitespace-nowrap overflow-hidden text-ellipsis">
          <button
            type="button"
            onClick={scrollToMidPrice}
            className={classNames('w-full h-full', {
              hidden: lockOnMidPrice,
              block: !lockOnMidPrice,
            })}
            data-testid="scroll-to-midprice"
          >
            {t('Go to mid')}
            <span className="ml-4">
              <Icon name="th-derived" />
            </span>
          </button>
        </div>
      </div>
      {debug && (
        <OrderbookDebugInfo
          decimalPlaces={decimalPlaces}
          resolution={resolution}
          numberOfRows={numberOfRows}
          viewportHeight={viewportHeight}
          lockOnMidPrice={lockOnMidPrice}
          priceInCenter={priceInCenter.current}
          maxPriceLevel={maxPriceLevel}
          bestStaticBidPrice={bestStaticBidPrice}
          bestStaticOfferPrice={bestStaticOfferPrice}
          minPriceLevel={minPriceLevel}
        />
      )}
    </div>
  );
  /* eslint-enable jsx-a11y/no-static-element-interactions */
};

export default Orderbook;
