import ReactVirtualizedAutoSizer from 'react-virtualized-auto-sizer';
import {
  addDecimalsFormatNumber,
  formatNumberFixed,
} from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import { OrderbookRow } from './orderbook-row';
import type { OrderbookData, OrderbookRowData } from './orderbook-data';
import { VolumeType } from './orderbook-data';
import { Splash } from '@vegaprotocol/ui-toolkit';
import { PriceCell } from '@vegaprotocol/datagrid';
import classNames from 'classnames';

interface OrderbookProps extends OrderbookData {
  decimalPlaces: number;
  positionDecimalPlaces: number;
  resolution: number;
  onResolutionChange: (resolution: number) => void;
  onClick?: (price: string) => void;
  markPrice?: string;
}

// 17px of row height plus 3.5px gap
export const rowHeight = 20.5;

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
      style={{ height: 'calc(50% - 20px)' }}
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
  resolution,
  onResolutionChange,
  onClick,
  markPrice = '',
  asks,
  bids,
}: OrderbookProps) => {
  const resolutions = new Array(
    Math.max(markPrice?.toString().length, decimalPlaces + 1)
  )
    .fill(null)
    .map((v, i) => Math.pow(10, i));

  /* eslint-disable jsx-a11y/no-static-element-interactions */
  return (
    <ReactVirtualizedAutoSizer>
      {({ width, height }) => {
        const limit = Math.floor((height - 60) / 2 / rowHeight);
        const askRows =
          asks?.slice(
            Math.max(0, Math.min(asks?.length || 0, asks?.length - limit))
          ) ?? [];
        const bidRows = bids?.slice(0, Math.max(0, limit)) ?? [];
        return (
          <div
            className="h-full w-full pl-1 text-xs grid grid-rows-[1fr_min-content] grid-cols-1"
            style={{ width, height }}
          >
            <div
              className="text-right w-full overflow-hidden"
              data-testid="orderbook-grid-element"
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
                  <div className="flex flex-shrink h-[40px] items-center justify-center text-lg">
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

            <div className="relative bottom-0 grid grid-cols-4 grid-rows-1 gap-2 border-t border-default z-10 bg-white dark:bg-black w-full">
              <div className="col-start-1">
                <select
                  onChange={(e) =>
                    onResolutionChange(Number(e.currentTarget.value))
                  }
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
      }}
    </ReactVirtualizedAutoSizer>
  );
  /* eslint-enable jsx-a11y/no-static-element-interactions */
};

export default Orderbook;
