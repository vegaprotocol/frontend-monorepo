import { memo } from 'react';
import type { ReactNode } from 'react';
import { LayoutPriority } from 'allotment';
import classNames from 'classnames';
import AutoSizer from 'react-virtualized-auto-sizer';
import type { PinnedAsset } from '@vegaprotocol/accounts';
import { t } from '@vegaprotocol/i18n';
import { OracleBanner } from '@vegaprotocol/markets';
import type { Market } from '@vegaprotocol/markets';
import { Filter } from '@vegaprotocol/orders';
import { Tab, LocalStoragePersistTabs as Tabs } from '@vegaprotocol/ui-toolkit';
import {
  ResizableGrid,
  ResizableGridPanel,
  usePaneLayout,
} from '../../components/resizable-grid';
import { TradingViews } from './trade-views';
import {
  MarketSuccessorBanner,
  MarketSuccessorProposalBanner,
} from '../../components/market-banner';
import { FLAGS } from '@vegaprotocol/environment';

interface TradeGridProps {
  market: Market | null;
  pinnedAsset?: PinnedAsset;
}

const MainGrid = memo(
  ({
    marketId,
    pinnedAsset,
  }: {
    marketId: string;
    pinnedAsset?: PinnedAsset;
  }) => {
    const [sizes, handleOnLayoutChange] = usePaneLayout({ id: 'top' });
    const [sizesMiddle, handleOnMiddleLayoutChange] = usePaneLayout({
      id: 'middle-1',
    });

    return (
      <ResizableGrid vertical onChange={handleOnLayoutChange}>
        <ResizableGridPanel
          preferredSize={sizes[0]}
          priority={LayoutPriority.High}
          minSize={200}
        >
          <ResizableGrid onChange={handleOnMiddleLayoutChange}>
            <ResizableGridPanel
              priority={LayoutPriority.High}
              minSize={200}
              preferredSize={sizesMiddle[0] || '75%'}
            >
              <TradeGridChild>
                <Tabs storageKey="console-trade-grid-main-left">
                  <Tab
                    id="chart"
                    overflowHidden
                    name={t('Chart')}
                    menu={<TradingViews.candles.menu />}
                  >
                    <TradingViews.candles.component marketId={marketId} />
                  </Tab>
                  <Tab id="depth" name={t('Depth')}>
                    <TradingViews.depth.component marketId={marketId} />
                  </Tab>
                  <Tab id="liquidity" name={t('Liquidity')}>
                    <TradingViews.liquidity.component marketId={marketId} />
                  </Tab>
                </Tabs>
              </TradeGridChild>
            </ResizableGridPanel>
            <ResizableGridPanel
              minSize={200}
              preferredSize={sizesMiddle[1] || 275}
            >
              <TradeGridChild>
                <Tabs storageKey="console-trade-grid-main-right">
                  <Tab id="orderbook" name={t('Orderbook')}>
                    <TradingViews.orderbook.component marketId={marketId} />
                  </Tab>
                  <Tab id="trades" name={t('Trades')}>
                    <TradingViews.trades.component marketId={marketId} />
                  </Tab>
                </Tabs>
              </TradeGridChild>
            </ResizableGridPanel>
          </ResizableGrid>
        </ResizableGridPanel>
        <ResizableGridPanel
          preferredSize={sizes[1] || '25%'}
          minSize={50}
          priority={LayoutPriority.Low}
        >
          <TradeGridChild>
            <Tabs storageKey="console-trade-grid-bottom">
              <Tab
                id="positions"
                name={t('Positions')}
                menu={<TradingViews.positions.menu />}
              >
                <TradingViews.positions.component />
              </Tab>
              <Tab
                id="open-orders"
                name={t('Open')}
                menu={<TradingViews.activeOrders.menu marketId={marketId} />}
              >
                <TradingViews.orders.component filter={Filter.Open} />
              </Tab>
              <Tab id="closed-orders" name={t('Closed')}>
                <TradingViews.orders.component filter={Filter.Closed} />
              </Tab>
              <Tab id="rejected-orders" name={t('Rejected')}>
                <TradingViews.orders.component filter={Filter.Rejected} />
              </Tab>
              <Tab
                id="orders"
                name={t('All')}
                menu={<TradingViews.orders.menu marketId={marketId} />}
              >
                <TradingViews.orders.component />
              </Tab>
              {FLAGS.STOP_ORDERS ? (
                <Tab id="stop-orders" name={t('Stop orders')}>
                  <TradingViews.stopOrders.component />
                </Tab>
              ) : null}
              <Tab id="fills" name={t('Fills')}>
                <TradingViews.fills.component />
              </Tab>
              <Tab
                id="accounts"
                name={t('Collateral')}
                menu={<TradingViews.collateral.menu />}
              >
                <TradingViews.collateral.component pinnedAsset={pinnedAsset} />
              </Tab>
            </Tabs>
          </TradeGridChild>
        </ResizableGridPanel>
      </ResizableGrid>
    );
  }
);
MainGrid.displayName = 'MainGrid';

export const TradeGrid = ({ market, pinnedAsset }: TradeGridProps) => {
  const wrapperClasses = classNames(
    'h-full grid',
    'grid-rows-[min-content_1fr]'
  );

  return (
    <div className={wrapperClasses}>
      <div>
        {FLAGS.SUCCESSOR_MARKETS && (
          <>
            <MarketSuccessorBanner market={market} />
            <MarketSuccessorProposalBanner marketId={market?.id} />
          </>
        )}
        <OracleBanner marketId={market?.id || ''} />
      </div>
      <div className="min-h-0 p-0.5">
        <MainGrid marketId={market?.id || ''} pinnedAsset={pinnedAsset} />
      </div>
    </div>
  );
};

interface TradeGridChildProps {
  children: ReactNode;
}

const TradeGridChild = ({ children }: TradeGridChildProps) => {
  return (
    <section className="h-full p-1">
      <AutoSizer>
        {({ width, height }) => (
          <div
            style={{ width, height }}
            className="border rounded-sm border-default"
          >
            {children}
          </div>
        )}
      </AutoSizer>
    </section>
  );
};
