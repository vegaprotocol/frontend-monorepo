import { useMemo, useRef, useState } from 'react';
import ReactVirtualizedAutoSizer from 'react-virtualized-auto-sizer';
import { addDecimalsFormatNumber } from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import { usePrevious } from '@vegaprotocol/react-helpers';
import { OrderbookRow } from './orderbook-row';
import type { OrderbookRowData } from './orderbook-data';
import { compactRows, VolumeType } from './orderbook-data';
import { Splash, VegaIcon, VegaIconNames } from '@vegaprotocol/ui-toolkit';
import classNames from 'classnames';
import type { PriceLevelFieldsFragment } from './__generated__/MarketDepth';
import { OrderbookControls } from './orderbook-controls';

// Sets row height, will be used to calculate number of rows that can be
// displayed each side of the book without overflow
export const rowHeight = 17;
const rowGap = 1;
const midHeight = 30;

type PriceChange = 'up' | 'down' | 'none';

const PRICE_CHANGE_ICON_MAP: Readonly<Record<PriceChange, VegaIconNames>> = {
  up: VegaIconNames.ARROW_UP,
  down: VegaIconNames.ARROW_DOWN,
  none: VegaIconNames.BULLET,
};
const PRICE_CHANGE_CLASS_MAP: Readonly<Record<PriceChange, string>> = {
  up: 'text-market-green-600 dark:text-market-green',
  down: 'text-market-red dark:text-market-red',
  none: 'text-vega-blue-500',
};

const OrderbookTable = ({
  rows,
  resolution,
  type,
  decimalPlaces,
  positionDecimalPlaces,
  onClick,
  width,
}: {
  rows: OrderbookRowData[];
  resolution: number;
  decimalPlaces: number;
  positionDecimalPlaces: number;
  type: VolumeType;
  onClick?: (args: { price?: string; size?: string }) => void;
  width: number;
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
      <div
        className="grid"
        style={{ gridAutoRows: rowHeight, gap: rowGap }} // use style as tailwind won't compile the dynamically set height
      >
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
            width={width}
          />
        ))}
      </div>
    </div>
  );
};

interface OrderbookProps {
  decimalPlaces: number;
  positionDecimalPlaces: number;
  onClick?: (args: { price?: string; size?: string }) => void;
  midPrice?: string;
  bids: PriceLevelFieldsFragment[];
  asks: PriceLevelFieldsFragment[];
  assetSymbol: string | undefined;
}

export const Orderbook = ({
  decimalPlaces,
  positionDecimalPlaces,
  onClick,
  midPrice,
  asks,
  bids,
  assetSymbol,
}: OrderbookProps) => {
  const [resolution, setResolution] = useState(1);

  const groupedAsks = useMemo(() => {
    return compactRows(asks, VolumeType.ask, resolution);
  }, [asks, resolution]);

  const groupedBids = useMemo(() => {
    return compactRows(bids, VolumeType.bid, resolution);
  }, [bids, resolution]);
  const previousMidPrice = usePrevious(midPrice);
  const priceChangeRef = useRef<'up' | 'down' | 'none'>('none');
  if (midPrice && previousMidPrice !== midPrice) {
    priceChangeRef.current =
      (previousMidPrice || '') > midPrice ? 'down' : 'up';
  }

  const priceChangeIcon = (
    <span
      className={classNames(PRICE_CHANGE_CLASS_MAP[priceChangeRef.current])}
    >
      <VegaIcon name={PRICE_CHANGE_ICON_MAP[priceChangeRef.current]} />
    </span>
  );

  return (
    <div className="h-full text-xs grid grid-rows-[1fr_min-content]">
      <div>
        <ReactVirtualizedAutoSizer>
          {({ width, height }) => {
            const limit = Math.max(
              1,
              Math.floor((height - midHeight) / 2 / (rowHeight + rowGap))
            );
            const askRows = groupedAsks?.slice(limit * -1) ?? [];
            const bidRows = groupedBids?.slice(0, limit) ?? [];
            return (
              <div
                className="overflow-hidden grid"
                data-testid="orderbook-grid-element"
                style={{
                  width: width + 'px',
                  height: height + 'px',
                  gridTemplateRows: `1fr ${midHeight}px 1fr`, // cannot use tailwind here as tailwind will not parse a class string with interpolation
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
                      width={width}
                    />
                    <div className="flex items-center justify-center gap-2">
                      {midPrice && (
                        <>
                          <span
                            className="font-mono text-lg"
                            data-testid={`middle-mark-price-${midPrice}`}
                          >
                            {addDecimalsFormatNumber(midPrice, decimalPlaces)}
                          </span>
                          <span className="text-base">{assetSymbol}</span>
                          {priceChangeIcon}
                        </>
                      )}
                    </div>
                    <OrderbookTable
                      rows={bidRows}
                      type={VolumeType.bid}
                      resolution={resolution}
                      decimalPlaces={decimalPlaces}
                      positionDecimalPlaces={positionDecimalPlaces}
                      onClick={onClick}
                      width={width}
                    />
                  </>
                ) : (
                  <div className="absolute inset-0">
                    <Splash>{t('No data')}</Splash>
                  </div>
                )}
              </div>
            );
          }}
        </ReactVirtualizedAutoSizer>
      </div>
      <div className="border-t border-default">
        <OrderbookControls
          midPrice={midPrice}
          resolution={resolution}
          decimalPlaces={decimalPlaces}
          setResolution={setResolution}
        />
      </div>
    </div>
  );
};

export default Orderbook;
