import type { PinnedAsset } from '@vegaprotocol/accounts';
import type { Market } from '@vegaprotocol/markets';
import { OracleBanner } from '@vegaprotocol/markets';
import {
  useMarketClickHandler,
  useMarketLiquidityClickHandler,
} from '../../lib/hooks/use-market-click-handler';
import type { TradingView } from './trade-views';
import { TradingViews } from './trade-views';
import { memo, useState } from 'react';
import {
  Icon,
  Splash,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { NO_MARKET } from './constants';
import AutoSizer from 'react-virtualized-auto-sizer';
import classNames from 'classnames';
import * as DialogPrimitives from '@radix-ui/react-dialog';
import { HeaderTitle } from '../../components/header';
import { MarketSelector } from './market-selector';
import { MarketSuccessorBanner } from '../../components/market-banner';
import { MarketHeaderStats } from './market-header-stats';

interface TradePanelsProps {
  market: Market | null;
  onSelect: (marketId: string, metaKey?: boolean) => void;
  onMarketClick?: (marketId: string) => void;
  onOrderTypeClick?: (marketId: string) => void;
  onClickCollateral: () => void;
  pinnedAsset?: PinnedAsset;
}

export const TradePanels = ({
  market,
  onSelect,
  onClickCollateral,
  pinnedAsset,
}: TradePanelsProps) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const onMarketClick = useMarketClickHandler(true);
  const onOrderTypeClick = useMarketLiquidityClickHandler();

  const [view, setView] = useState<TradingView>('candles');
  const renderView = () => {
    const Component = memo<{
      marketId: string;
      onSelect: (marketId: string, metaKey?: boolean) => void;
      onMarketClick?: (marketId: string) => void;
      onOrderTypeClick?: (marketId: string) => void;
      onClickCollateral: () => void;
      pinnedAsset?: PinnedAsset;
    }>(TradingViews[view].component);

    if (!Component) {
      throw new Error(`No component for view: ${view}`);
    }

    if (!market) return <Splash>{NO_MARKET}</Splash>;

    return (
      <Component
        marketId={market?.id}
        onSelect={onSelect}
        onClickCollateral={onClickCollateral}
        pinnedAsset={pinnedAsset}
        onMarketClick={onMarketClick}
        onOrderTypeClick={onOrderTypeClick}
      />
    );
  };

  return (
    <div className="h-full grid grid-rows-[min-content_min-content_1fr_min-content]">
      <div className="border-b border-default min-w-0">
        <div className="flex gap-4 items-center px-4 py-2">
          <HeaderTitle>
            {market?.tradableInstrument.instrument.code}
          </HeaderTitle>
          <button onClick={() => setDrawerOpen((x) => !x)} className="p-2">
            <span
              className={classNames('block', {
                'rotate-90 translate-x-1': !drawerOpen,
                '-rotate-90 -translate-x-1': drawerOpen,
              })}
            >
              <VegaIcon name={VegaIconNames.CHEVRON_UP} />
            </span>
          </button>
        </div>
        <MarketHeaderStats market={market} />
      </div>
      <div>
        <MarketSuccessorBanner market={market} />
        <OracleBanner marketId={market?.id || ''} />
      </div>
      <div className="h-full">
        <AutoSizer>
          {({ width, height }) => (
            <div style={{ width, height }} className="overflow-auto">
              {renderView()}
            </div>
          )}
        </AutoSizer>
      </div>
      <div className="flex flex-nowrap overflow-x-auto max-w-full border-t border-default">
        {Object.keys(TradingViews).map((key) => {
          const isActive = view === key;
          const className = classNames('p-4 min-w-[100px] capitalize', {
            'text-black dark:text-vega-yellow': isActive,
            'bg-neutral-200 dark:bg-neutral-800': isActive,
          });
          return (
            <button
              data-testid={key}
              onClick={() => setView(key as TradingView)}
              className={className}
              key={key}
            >
              {TradingViews[key as keyof typeof TradingViews].label}
            </button>
          );
        })}
      </div>
      <DialogPrimitives.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DialogPrimitives.Portal>
          <DialogPrimitives.Overlay />
          <DialogPrimitives.Content
            className={classNames(
              'fixed h-full max-w-[500px] w-[90vw] z-10 top-0 left-0 transition-transform',
              'bg-white dark:bg-black',
              'border-r border-default'
            )}
          >
            <DialogPrimitives.Close className="absolute top-0 right-0 p-2">
              <Icon name="cross" />
            </DialogPrimitives.Close>
            {drawerOpen && (
              <MarketSelector onSelect={() => setDrawerOpen(false)} />
            )}
          </DialogPrimitives.Content>
        </DialogPrimitives.Portal>
      </DialogPrimitives.Root>
    </div>
  );
};
