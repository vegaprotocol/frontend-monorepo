import { useCallback, useEffect, useRef, useState } from 'react';
import {
  addDecimalsFormatNumber,
  formatNumberFixed,
} from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import { useResizeObserver } from '@vegaprotocol/react-helpers';
import * as Schema from '@vegaprotocol/types';
import { OrderbookContinuousRow } from './orderbook-row';
import type { OrderbookData } from './orderbook-data';
import { VolumeType } from './orderbook-data';
import { Splash } from '@vegaprotocol/ui-toolkit';
import { PriceCell } from '@vegaprotocol/datagrid';

interface OrderbookProps extends OrderbookData {
  decimalPlaces: number;
  positionDecimalPlaces: number;
  resolution: number;
  onResolutionChange: (resolution: number) => void;
  onClick?: (price: string) => void;
}

// 17px of row height plus 4px gap
export const rowHeight = 21;

export const Orderbook = ({
  marketTradingMode,
  indicativeVolume,
  indicativePrice,
  decimalPlaces,
  positionDecimalPlaces,
  resolution,
  onResolutionChange,
  onClick,
  markPrice = '',
  asks,
  bids,
}: OrderbookProps) => {
  const rootElement = useRef<HTMLDivElement>(null);
  const gridElement = useRef<HTMLDivElement>(null);
  const footerElement = useRef<HTMLDivElement>(null);
  const resolutionRef = useRef(resolution);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);

  const limit = Math.floor((viewportHeight - 60) / 2 / rowHeight);
  const askRows = asks?.slice(0, Math.max(0, limit)) ?? [];
  const bidRows = bids?.slice(0, Math.max(0, limit)) ?? [];

  useEffect(() => {
    if (resolutionRef.current !== resolution) {
      resolutionRef.current = resolution;
    }
  }, [resolution]);

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
  useResizeObserver(rootElement.current, rootElementResizeHandler);

  const tableBodyUp = askRows?.length ? (
    <div
      className="text-right w-full flex flex-col justify-end"
      style={{ height: 'calc(50% - 20px)' }}
    >
      <div className="grid auto-rows-[17px] gap-1">
        {askRows.map((data, i) => (
          <OrderbookContinuousRow
            key={data.price}
            price={(BigInt(data.price) / BigInt(resolution)).toString()}
            onClick={onClick}
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
            type={VolumeType.ask}
          />
        ))}
      </div>
    </div>
  ) : null;

  const tableBodyDown = bidRows?.length ? (
    <div
      className="text-right w-full flex flex-col justify-start"
      style={{ height: 'calc(50% - 20px)' }}
    >
      <div className="grid auto-rows-[17px] gap-1">
        {bidRows.map((data, i) => (
          <OrderbookContinuousRow
            key={data.price}
            price={(BigInt(data.price) / BigInt(resolution)).toString()}
            onClick={onClick}
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
            type={VolumeType.bid}
          />
        ))}
      </div>
    </div>
  ) : null;

  const resolutions = new Array(
    Math.max(markPrice?.toString().length, decimalPlaces + 1)
  )
    .fill(null)
    .map((v, i) => Math.pow(10, i));

  /* eslint-disable jsx-a11y/no-static-element-interactions */
  return (
    <div
      className="h-full pl-1 text-xs w-full grid grid-rows-[1fr_min-content] grid-cols-1"
      ref={rootElement}
    >
      <div
        className="text-right w-full overflow-hidden"
        data-testid="orderbook-grid-element"
        ref={gridElement}
      >
        {tableBodyUp || tableBodyDown ? (
          <>
            {tableBodyUp}
            <div className="flex flex-shrink h-[40px] items-center justify-center text-lg">
              <PriceCell
                value={Number(markPrice)}
                valueFormatted={addDecimalsFormatNumber(
                  markPrice,
                  decimalPlaces,
                  2
                )}
                testId={`middle-mark-price-${markPrice}`}
              />
            </div>
            {tableBodyDown}
          </>
        ) : (
          <div className="inset-0 absolute">
            <Splash>{t('No data')}</Splash>
          </div>
        )}
      </div>

      <div
        className="relative bottom-0 grid grid-cols-4 grid-rows-1 gap-2 border-t border-default mt-2 z-10 bg-white dark:bg-black w-full"
        ref={footerElement}
      >
        <div className="col-start-1">
          <select
            onChange={(e) => onResolutionChange(Number(e.currentTarget.value))}
            value={resolution}
            className="block bg-neutral-100 dark:bg-neutral-700 font-mono text-right w-full h-full"
            data-testid="resolution"
          >
            {resolutions.map((r) => (
              <option key={r} value={r}>
                {formatNumberFixed(
                  Math.log10(r) - decimalPlaces > 0
                    ? Math.pow(10, Math.log10(r) - decimalPlaces)
                    : 0,
                  decimalPlaces - Math.log10(r)
                )}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
  /* eslint-enable jsx-a11y/no-static-element-interactions */
};

export default Orderbook;
