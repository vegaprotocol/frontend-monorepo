import { VegaIcon, VegaIconNames } from '@vegaprotocol/ui-toolkit';
import { MarketSelector } from '../market-selector';
import { useMarket } from '@vegaprotocol/markets';
import { t } from '@vegaprotocol/i18n';
import { useParams } from 'react-router-dom';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { useState } from 'react';

/**
 * This is only rendered for the mobile navigation
 */
export const NavHeader = () => {
  const { marketId } = useParams();
  const { data } = useMarket(marketId);
  const [open, setOpen] = useState(false);

  if (!marketId) return null;

  return (
    <FullScreenPopover
      open={open}
      onOpenChange={(x) => {
        setOpen(x);
      }}
      trigger={
        <h1 className="flex gap-4 items-center text-default text-lg whitespace-nowrap xl:pr-4 xl:border-r border-default">
          {data ? data.tradableInstrument.instrument.code : t('Select market')}
          <VegaIcon name={VegaIconNames.CHEVRON_DOWN} size={20} />
        </h1>
      }
    >
      <MarketSelector
        currentMarketId={marketId}
        onSelect={() => setOpen(false)}
      />
    </FullScreenPopover>
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
