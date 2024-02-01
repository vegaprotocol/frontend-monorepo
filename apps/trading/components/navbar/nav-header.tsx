import { VegaIcon, VegaIconNames } from '@vegaprotocol/ui-toolkit';
import { MarketSelector } from '../market-selector';
import { useMarket, useMarketList } from '@vegaprotocol/markets';
import { useParams } from 'react-router-dom';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { useState } from 'react';
import { useT } from '../../lib/use-t';
import classNames from 'classnames';

/**
 * This is only rendered for the mobile navigation
 */
export const NavHeader = () => {
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
    <div className="flex items-center gap-2">
      <FullScreenPopover
        open={openMarket}
        onOpenChange={(x) => {
          setOpenMarket(x);
        }}
        trigger={
          <h1 className="flex gap-1 sm:gap-2 md:gap-4 items-center text-default text-sm md:text-lg whitespace-nowrap xl:pr-4 xl:border-r border-default">
            {data
              ? data.tradableInstrument.instrument.code
              : t('Select market')}
            <span
              className={classNames(
                'transition-transform ease-in-out duration-300',
                {
                  'rotate-180': openMarket,
                }
              )}
            >
              <VegaIcon name={VegaIconNames.CHEVRON_DOWN} size={12} />
            </span>
          </h1>
        }
      >
        <MarketSelector
          currentMarketId={marketId}
          onSelect={() => setOpenMarket(false)}
        />
      </FullScreenPopover>
      {/* // TODO MOBILE - price popover with market header content */}
      <FullScreenPopover
        open={openPrice}
        onOpenChange={(x) => {
          setOpenPrice(x);
        }}
        trigger={
          <h1 className="flex gap-1 sm:gap-2 md:gap-4 items-center text-default text-xs md:text-md whitespace-nowrap xl:pr-4 xl:border-r border-default">
            44,500
            <span
              className={classNames(
                'transition-transform ease-in-out duration-300',
                {
                  'rotate-180': openPrice,
                }
              )}
            >
              <VegaIcon name={VegaIconNames.CHEVRON_DOWN} size={12} />
            </span>
          </h1>
        }
      >
        <MarketSelector
          currentMarketId={marketId}
          onSelect={() => setOpenMarket(false)}
        />
        {/* <MarketHeader /> */}
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
          className="w-screen bg-vega-clight-800 dark:bg-vega-cdark-800 text-default border border-default"
          sideOffset={5}
        >
          {children}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
};
