import type { PinnedAsset } from '@vegaprotocol/accounts';
import type { Market } from '@vegaprotocol/markets';
import { OracleBanner } from '@vegaprotocol/markets';
import type { TradingView } from './trade-views';
import { TradingViews } from './trade-views';
import { useState } from 'react';
import { Splash } from '@vegaprotocol/ui-toolkit';
import { NO_MARKET } from './constants';
import AutoSizer from 'react-virtualized-auto-sizer';
import classNames from 'classnames';
import {
  MarketSuccessorBanner,
  MarketSuccessorProposalBanner,
  MarketTerminationBanner,
} from '../../components/market-banner';
import { FLAGS } from '@vegaprotocol/environment';

interface TradePanelsProps {
  market: Market | null;
  pinnedAsset?: PinnedAsset;
}

export const TradePanels = ({ market, pinnedAsset }: TradePanelsProps) => {
  const [view, setView] = useState<TradingView>('candles');

  const renderView = () => {
    const Component = TradingViews[view].component;

    if (!Component) {
      throw new Error(`No component for view: ${view}`);
    }

    if (!market) return <Splash>{NO_MARKET}</Splash>;

    return <Component marketId={market?.id} pinnedAsset={pinnedAsset} />;
  };

  const renderMenu = () => {
    const viewCfg = TradingViews[view];

    if ('menu' in viewCfg) {
      const Menu = viewCfg.menu;

      return (
        <div className="flex gap-1 p-1 bg-vega-clight-800 dark:bg-vega-cdark-800 border-b border-default">
          <Menu marketId={market?.id || ''} />
        </div>
      );
    }

    return null;
  };

  return (
    <div className="h-full grid grid-rows-[min-content_min-content_1fr_min-content]">
      <div>
        {FLAGS.SUCCESSOR_MARKETS && (
          <>
            <MarketSuccessorBanner market={market} />
            <MarketSuccessorProposalBanner marketId={market?.id} />
          </>
        )}
        <MarketTerminationBanner market={market} />
        <OracleBanner marketId={market?.id || ''} />
      </div>
      <div>{renderMenu()}</div>
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
          const className = classNames(
            'py-2 px-4 min-w-[100px] capitalize text-sm',
            {
              'bg-vega-clight-500 dark:bg-vega-cdark-500': isActive,
            }
          );
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
