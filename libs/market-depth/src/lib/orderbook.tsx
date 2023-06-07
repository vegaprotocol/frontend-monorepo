import { useMemo } from 'react';
import ReactVirtualizedAutoSizer from 'react-virtualized-auto-sizer';
import {
  addDecimalsFormatNumber,
  formatNumberFixed,
} from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import { OrderbookRow } from './orderbook-row';
import type { OrderbookRowData } from './orderbook-data';
import { compactRows, VolumeType } from './orderbook-data';
import { Splash } from '@vegaprotocol/ui-toolkit';
import classNames from 'classnames';
import { useState } from 'react';
import type { PriceLevelFieldsFragment } from './__generated__/MarketDepth';

interface OrderbookProps {
  decimalPlaces: number;
  positionDecimalPlaces: number;
  onClick?: (price: string) => void;
  midPrice?: string;
  bids: PriceLevelFieldsFragment[];
  asks: PriceLevelFieldsFragment[];
}

// Sets row height, will be used to calculate number of rows that can be
// displayed each side of the book without overflow
export const rowHeight = 17;
const midHeight = 30;

const OrderbookTable = ({
  rows,
  resolution,
  type,
  decimalPlaces,
  positionDecimalPlaces,
  onClick,
}: {
  rows: OrderbookRowData[];
  resolution: number;
  decimalPlaces: number;
  positionDecimalPlaces: number;
  type: VolumeType;
  onClick?: (price: string) => void;
}) => {
  return (
    <div
      className={
        // position the ask side to the bottow of the top section and the bid side to the top of the bottom section
        classNames(
          'flex flex-col',
          type === VolumeType.ask ? 'justify-end' : 'justify-start'
        )
      }
    >
      <div className={`grid auto-rows-[${rowHeight}px]`}>
        {rows.map((data) => (
          <OrderbookRow
            key={data.price}
            price={(BigInt(data.price) / BigInt(resolution)).toString()}
            onClick={onClick}
            decimalPlaces={decimalPlaces - Math.log10(resolution)}
            positionDecimalPlaces={positionDecimalPlaces}
            value={data.value}
            cumulativeValue={data.cumulativeVol.value}
            cumulativeRelativeValue={data.cumulativeVol.relativeValue}
            type={type}
          />
        ))}
      </div>
    </div>
  );
};

export const Orderbook = ({
  decimalPlaces,
  positionDecimalPlaces,
  onClick,
  midPrice,
  asks,
  bids,
}: OrderbookProps) => {
  const [resolution, setResolution] = useState(1);
  const resolutions = new Array(
    Math.max(midPrice?.toString().length ?? 0, decimalPlaces + 1)
  )
    .fill(null)
    .map((v, i) => Math.pow(10, i));

  const groupedAsks = useMemo(() => {
    return compactRows(asks, VolumeType.ask, resolution);
  }, [asks, resolution]);

  const groupedBids = useMemo(() => {
    return compactRows(bids, VolumeType.bid, resolution);
  }, [bids, resolution]);

  return (
    <div className="h-full pl-1 text-xs grid grid-rows-[1fr_min-content]">
      <div>
        <ReactVirtualizedAutoSizer disableWidth>
          {({ height }) => {
            const limit = Math.max(
              1,
              Math.floor((height - midHeight) / 2 / rowHeight)
            );
            const askRows = groupedAsks?.slice(limit * -1) ?? [];
            const bidRows = groupedBids?.slice(0, limit) ?? [];
            return (
              <div
                className="overflow-hidden grid"
                data-testid="orderbook-grid-element"
                style={{
                  height: height + 'px',
                  gridTemplateRows: `1fr ${midHeight}px 1fr`,
                }}
              >
                {askRows.length || bidRows.length ? (
                  <>
                    <OrderbookTable
                      rows={askRows}
                      type={VolumeType.ask}
                      resolution={resolution}
                      decimalPlaces={decimalPlaces}
                      positionDecimalPlaces={positionDecimalPlaces}
                      onClick={onClick}
                    />
                    <div className="flex items-center justify-center text-lg">
                      {midPrice && (
                        <span
                          className="font-mono"
                          data-testid={`middle-mark-price-${midPrice}`}
                        >
                          {addDecimalsFormatNumber(midPrice, decimalPlaces)}
                        </span>
                      )}
                    </div>
                    <OrderbookTable
                      rows={bidRows}
                      type={VolumeType.bid}
                      resolution={resolution}
                      decimalPlaces={decimalPlaces}
                      positionDecimalPlaces={positionDecimalPlaces}
                      onClick={onClick}
                    />
                  </>
                ) : (
                  <div className="inset-0 absolute">
                    <Splash>{t('No data')}</Splash>
                  </div>
                )}
              </div>
            );
          }}
        </ReactVirtualizedAutoSizer>
      </div>
      <div className="border-t border-default">
        <select
          onChange={(e) => {
            setResolution(Number(e.currentTarget.value));
          }}
          value={resolution}
          className="block bg-neutral-100 dark:bg-neutral-700 font-mono text-right"
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
  );
};

export default Orderbook;
