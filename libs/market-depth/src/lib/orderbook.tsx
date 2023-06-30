import { useMemo, useRef, useState } from 'react';
import ReactVirtualizedAutoSizer from 'react-virtualized-auto-sizer';
import {
  addDecimalsFormatNumber,
  formatNumberFixed,
} from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import { usePrevious } from '@vegaprotocol/react-helpers';
import { OrderbookRow } from './orderbook-row';
import type { OrderbookRowData } from './orderbook-data';
import { compactRows, VolumeType } from './orderbook-data';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Splash,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import classNames from 'classnames';
import type { PriceLevelFieldsFragment } from './__generated__/MarketDepth';

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
  const [isOpen, setOpen] = useState(false);
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

  const formatResolution = (r: number) => {
    return formatNumberFixed(
      Math.log10(r) - decimalPlaces > 0
        ? Math.pow(10, Math.log10(r) - decimalPlaces)
        : 0,
      decimalPlaces - Math.log10(r)
    );
  };

  const increaseResolution = () => {
    const index = resolutions.indexOf(resolution);
    if (index < resolutions.length - 1) {
      setResolution(resolutions[index + 1]);
    }
  };

  const decreaseResolution = () => {
    const index = resolutions.indexOf(resolution);
    if (index > 0) {
      setResolution(resolutions[index - 1]);
    }
  };

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
                  <div className="inset-0 absolute">
                    <Splash>{t('No data')}</Splash>
                  </div>
                )}
              </div>
            );
          }}
        </ReactVirtualizedAutoSizer>
      </div>
      <div className="border-t border-default flex">
        <Button
          onClick={increaseResolution}
          size="xs"
          disabled={resolutions.indexOf(resolution) >= resolutions.length - 1}
          className="text-black dark:text-white rounded-none border-y-0 border-l-0 flex items-center border-r-1"
          data-testid="plus-button"
        >
          <VegaIcon size={12} name={VegaIconNames.PLUS} />
        </Button>
        <DropdownMenu
          open={isOpen}
          onOpenChange={(open) => setOpen(open)}
          trigger={
            <DropdownMenuTrigger
              data-testid="resolution"
              className="flex justify-between px-1 items-center"
              style={{
                width: `${
                  Math.max.apply(
                    null,
                    resolutions.map((item) => formatResolution(item).length)
                  ) + 3
                }ch`,
              }}
            >
              <VegaIcon
                size={12}
                name={
                  isOpen ? VegaIconNames.CHEVRON_UP : VegaIconNames.CHEVRON_DOWN
                }
              />
              <div className="text-xs text-left">
                {formatResolution(resolution)}
              </div>
            </DropdownMenuTrigger>
          }
        >
          <DropdownMenuContent align="start">
            {resolutions.map((r) => (
              <DropdownMenuItem key={r} onClick={() => setResolution(r)}>
                {formatResolution(r)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          onClick={decreaseResolution}
          size="xs"
          disabled={resolutions.indexOf(resolution) <= 0}
          className="text-black dark:text-white rounded-none border-y-0 border-l-1 flex items-center"
          data-testid="minus-button"
        >
          <VegaIcon size={12} name={VegaIconNames.MINUS} />
        </Button>
      </div>
    </div>
  );
};

export default Orderbook;
