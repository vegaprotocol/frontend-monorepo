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
import { cn } from '@vegaprotocol/ui-toolkit';
import { MarketHeaderSwitch } from './market-header-switch';
import { MarketMarkPrice } from '../market-mark-price';
import { MarketBanner } from '../market-banner';
import { EmblemByMarket } from '@vegaprotocol/emblem';
import { useChainId } from '@vegaprotocol/wallet-react';
import { MarketBannerIndicator } from '../market-banner/market-banner';
/**
 * This is only rendered for the mobile navigation
 */
export const MobileMarketHeader = () => {
  const t = useT();
  const { marketId } = useParams();
  const { data } = useMarket(marketId);
  const [openMarket, setOpenMarket] = useState(false);
  const [openPrice, setOpenPrice] = useState(false);
  const { chainId } = useChainId();

  // Ensure that markets are kept cached so opening the list
  // shows all markets instantly
  useMarketList();

  if (!marketId) return null;

  return (
    <div>
      <div className="pl-3 pr-2 grid grid-cols-2 h-10 bg-surface-2 ">
        <FullScreenPopover
          open={openMarket}
          onOpenChange={(x) => {
            setOpenMarket(x);
          }}
          trigger={
            <button
              data-testid="popover-trigger"
              className="min-w-0 flex gap-1 items-center"
            >
              <h1 className="whitespace-nowrap overflow-hidden text-ellipsis items-center">
                <span className="flex items-center">
                  {marketId && (
                    <span className="mr-2">
                      <EmblemByMarket market={marketId} vegaChain={chainId} />
                    </span>
                  )}
                  {data
                    ? data.tradableInstrument.instrument.code
                    : t('Select market')}
                </span>
              </h1>
              <VegaIcon
                name={VegaIconNames.CHEVRON_DOWN}
                size={16}
                className={cn(
                  'origin-center transition-transform ease-in-out duration-300 flex',
                  {
                    'rotate-180': openMarket,
                  }
                )}
              />
            </button>
          }
        >
          <MarketSelector
            currentMarketId={marketId}
            onSelect={() => setOpenMarket(false)}
            className="md:w-[680px]"
          />
        </FullScreenPopover>
        <div className="w-full flex gap-4 justify-end">
          {data && <MarketBannerIndicator market={data} kind="ActiveReward" />}
          <FullScreenPopover
            open={openPrice}
            onOpenChange={(x) => {
              setOpenPrice(x);
            }}
            trigger={
              <button
                data-testid="popover-trigger"
                className="min-w-0 flex gap-2 items-center justify-end justify-self-end"
              >
                {data && (
                  <>
                    <span className="min-w-0 flex flex-col items-end gap-0">
                      <span className="text-sm">
                        <MarketMarkPrice
                          marketId={data.id}
                          decimalPlaces={data.decimalPlaces}
                        />
                      </span>
                      <span className="text-xs">
                        <Last24hPriceChange
                          marketId={data.id}
                          decimalPlaces={data.decimalPlaces}
                          fallback={<span />} // dont render anything so price is vertically centered
                        />
                      </span>
                    </span>
                    <VegaIcon
                      name={VegaIconNames.CHEVRON_DOWN}
                      size={16}
                      className={cn(
                        'min-w-0 transition-transform ease-in-out duration-300',
                        {
                          'rotate-180': openPrice,
                        }
                      )}
                    />
                  </>
                )}
              </button>
            }
          >
            {data && (
              <div>
                <div className="px-3 py-6 text-sm grid grid-cols-2 items-center gap-x-4 gap-y-6">
                  <MarketHeaderSwitch market={data} />
                </div>
              </div>
            )}
          </FullScreenPopover>
        </div>
      </div>
      {data && <MarketBanner market={data} />}
    </div>
  );
};

interface PopoverProps extends PopoverPrimitive.PopoverProps {
  trigger: React.ReactNode | string;
}

const FullScreenPopover = ({
  trigger,
  children,
  open,
  onOpenChange,
}: PopoverProps) => {
  return (
    <PopoverPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <PopoverPrimitive.Trigger asChild={true}>
        {trigger}
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          data-testid="popover-content"
          className="w-screen bg-surface-1  border-y border-gs-300 dark:border-gs-700"
          sideOffset={0}
        >
          {children}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
};
