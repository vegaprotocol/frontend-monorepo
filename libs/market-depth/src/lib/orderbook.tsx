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
import { PriceCell } from '@vegaprotocol/datagrid';
import classNames from 'classnames';
import { useState } from 'react';
import type { PriceLevelFieldsFragment } from './__generated__/MarketDepth';

interface OrderbookProps {
  decimalPlaces: number;
  positionDecimalPlaces: number;
  onClick?: (price: string) => void;
  markPrice?: string;
  bids: PriceLevelFieldsFragment[];
  asks: PriceLevelFieldsFragment[];
}

// 17px of row height plus 3px gap
export const rowHeight = 20;
const MID_PRICE_HEIGHT = 40;

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
      className={classNames(
        'text-right w-full flex flex-col',
        type === VolumeType.ask ? 'justify-end' : 'justify-start'
      )}
    >
      <div className="grid auto-rows-[17px] gap-1">
        {rows.map((data, i) => (
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
  markPrice = '',
  asks,
  bids,
}: OrderbookProps) => {
  const [resolution, setResolution] = useState(1);
  const resolutions = new Array(
    Math.max(markPrice?.toString().length, decimalPlaces + 1)
  )
    .fill(null)
    .map((v, i) => Math.pow(10, i));

  const groupedAsks = useMemo(() => {
    return compactRows(asks, VolumeType.ask, resolution);
  }, [asks, resolution]);

  const groupedBids = useMemo(() => {
    return compactRows(bids, VolumeType.bid, resolution);
  }, [bids, resolution]);

  /* eslint-disable jsx-a11y/no-static-element-interactions */
  return (
    <div className="h-full w-full pl-1 text-xs grid grid-rows-[1fr_min-content] grid-cols-1 overflow-hidden">
      <div>
        <ReactVirtualizedAutoSizer disableWidth>
          {({ height }) => {
            const limit = Math.floor((height - 60) / 2 / rowHeight);
            const askRows =
              groupedAsks?.slice(
                Math.max(
                  0,
                  Math.min(
                    groupedAsks?.length || 0,
                    groupedAsks?.length - limit
                  )
                )
              ) ?? [];
            const bidRows = groupedBids?.slice(0, Math.max(0, limit)) ?? [];
            return (
              <div
                className="text-right w-full overflow-hidden grid grid-rows-[1fr_min-content_1fr]"
                data-testid="orderbook-grid-element"
                style={{ height: height + 'px' }}
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
                    <div
                      className={`flex flex-shrink h-[${MID_PRICE_HEIGHT}px] items-center justify-center text-lg`}
                    >
                      <PriceCell
                        value={Number(markPrice)}
                        valueFormatted={addDecimalsFormatNumber(
                          markPrice,
                          decimalPlaces
                        )}
                        testId={`middle-mark-price-${markPrice}`}
                      />
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
      <div className="relative bottom-0 grid grid-cols-4 grid-rows-1 gap-2 border-t border-default z-10 bg-white dark:bg-black w-full">
        <div className="col-start-1">
          <select
            onChange={(e) => {
              setResolution(Number(e.currentTarget.value));
            }}
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
