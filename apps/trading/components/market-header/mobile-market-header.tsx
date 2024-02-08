import { VegaIcon, VegaIconNames } from '@vegaprotocol/ui-toolkit';
import { MarketSelector } from '../market-selector';
import {
  Last24hPriceChange,
  useMarket,
  useMarketList,
} from '@vegaprotocol/markets';
import { useParams } from 'react-router-dom';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { useState } from 'react';
import { useT } from '../../lib/use-t';
import classNames from 'classnames';
import { MarketHeaderStats } from '../../client-pages/market/market-header-stats';
import { MarketMarkPrice } from '../market-mark-price';
/**
 * This is only rendered for the mobile navigation
 */
export const MobileMarketHeader = () => {
  const t = useT();
  const { marketId } = useParams();
  const { data } = useMarket(marketId);
  const [openMarket, setOpenMarket] = useState(false);
  const [openPrice, setOpenPrice] = useState(false);

  // Ensure that markets are kept cached so opening the list
  // shows all markets instantly
  useMarketList();

  if (!marketId) return null;

  return (
    <div className="pl-3 pr-2 flex justify-between gap-2 h-10 bg-vega-clight-700 dark:bg-vega-cdark-700">
      <FullScreenPopover
        open={openMarket}
        onOpenChange={(x) => {
          setOpenMarket(x);
        }}
        trigger={
          <h1 className="flex gap-1 sm:gap-2 md:gap-4 items-center text-lg md:text-lg whitespace-nowrap">
            {data
              ? data.tradableInstrument.instrument.code
              : t('Select market')}
            <span
              className={classNames(
                'transition-transform ease-in-out duration-300 flex',
                {
                  'rotate-180': openMarket,
                }
              )}
            >
              <VegaIcon name={VegaIconNames.CHEVRON_DOWN} size={16} />
            </span>
          </h1>
        }
      >
        <MarketSelector
          currentMarketId={marketId}
          onSelect={() => setOpenMarket(false)}
        />
      </FullScreenPopover>
      <FullScreenPopover
        open={openPrice}
        onOpenChange={(x) => {
          setOpenPrice(x);
        }}
        trigger={
          <span className="flex gap-1 items-center md:text-md whitespace-nowrap">
            {data && (
              <>
                <span className="text-xs">
                  <Last24hPriceChange
                    marketId={data.id}
                    decimalPlaces={data.decimalPlaces}
                  />
                </span>
                <MarketMarkPrice
                  marketId={data.id}
                  decimalPlaces={data.decimalPlaces}
                />
              </>
            )}
            <span
              className={classNames(
                'transition-transform ease-in-out duration-300',
                {
                  'rotate-180': openPrice,
                }
              )}
            >
              <VegaIcon name={VegaIconNames.CHEVRON_DOWN} size={16} />
            </span>
          </span>
        }
      >
        {data && (
          <div className="p-4 text-sm grid grid-cols-2 items-center gap-4">
            <MarketHeaderStats market={data} />
          </div>
        )}
      </FullScreenPopover>
    </div>
  );
};

export interface PopoverProps extends PopoverPrimitive.PopoverProps {
  trigger: React.ReactNode | string;
}

export const FullScreenPopover = ({
  trigger,
  children,
  open,
  onOpenChange,
}: PopoverProps) => {
  return (
    <PopoverPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <PopoverPrimitive.Trigger data-testid="popover-trigger">
        {trigger}
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          data-testid="popover-content"
          className="w-screen bg-vega-clight-800 dark:bg-vega-cdark-800 border-y border-default"
          sideOffset={0}
        >
          {children}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
};
