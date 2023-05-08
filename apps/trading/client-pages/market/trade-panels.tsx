import type { PinnedAsset } from '@vegaprotocol/accounts';
import type { Market } from '@vegaprotocol/market-list';
import {
  useMarketClickHandler,
  useMarketLiquidityClickHandler,
} from '../../lib/hooks/use-market-click-handler';
import type { TradingView } from './trade-views';
import { TradingViews } from './trade-views';
import { memo, useState } from 'react';
import { Splash } from '@vegaprotocol/ui-toolkit';
import { NO_MARKET } from './constants';
import { TradeMarketHeader } from './trade-market-header';
import { OracleBanner } from '../../components/banner';
import AutoSizer from 'react-virtualized-auto-sizer';
import classNames from 'classnames';

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
  const onMarketClick = useMarketClickHandler(true);
  const onOrderTypeClick = useMarketLiquidityClickHandler(true);

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
    <div className="h-full grid grid-rows-[min-content_1fr_min-content]">
      <div>
        <TradeMarketHeader market={market} onSelect={onSelect} />
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
    </div>
  );
};
