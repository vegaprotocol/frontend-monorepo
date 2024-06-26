import { memo, type ReactNode } from 'react';
import { LayoutPriority } from 'allotment';
import { useFeatureFlags } from '@vegaprotocol/environment';
import { type Market } from '@vegaprotocol/markets';
import { Tab, LocalStoragePersistTabs as Tabs } from '@vegaprotocol/ui-toolkit';
import {
  ResizableGrid,
  ResizableGridPanel,
  usePaneLayout,
} from '../../components/resizable-grid';
import { TradingViews } from './trade-views';
import { useT } from '../../lib/use-t';
import { ErrorBoundary } from '../../components/error-boundary';
import { MarketBanner } from '../../components/market-banner';
import { MarketHeader } from '../../components/market-header';
import { Sidebar } from '../../components/sidebar';

interface TradeGridProps {
  market: Market;
  pinnedAssets?: string[] | undefined;
}

const MainGrid = memo(
  ({ market, pinnedAssets }: { market: Market; pinnedAssets?: string[] }) => {
    const featureFlags = useFeatureFlags((state) => state.flags);
    const t = useT();
    const [rowSizes, handleRowSizes] = usePaneLayout({
      id: 'row',
    });
    const [innerRowSizes, handleInnerRowChange] = usePaneLayout({
      id: 'inner-row',
    });
    const [verticalSizes, handleVerticalChange] = usePaneLayout({
      id: 'col',
    });

    return (
      <ResizableGrid onChange={handleRowSizes}>
        <ResizableGridPanel preferredSize={rowSizes[0]}>
          <ResizableGrid vertical onChange={handleVerticalChange}>
            <ResizableGridPanel minSize={49} maxSize={49}>
              <TradeGridChild>
                <MarketHeader />
              </TradeGridChild>
            </ResizableGridPanel>
            <ResizableGridPanel
              preferredSize={verticalSizes[0]}
              priority={LayoutPriority.High}
              minSize={200}
            >
              <ResizableGrid onChange={handleInnerRowChange}>
                <ResizableGridPanel
                  priority={LayoutPriority.High}
                  minSize={200}
                  preferredSize={innerRowSizes[0] || '75%'}
                >
                  <TradeGridChild>
                    <Tabs storageKey="console-trade-grid-main-left">
                      <Tab
                        id="chart"
                        overflowHidden
                        name={t('Chart')}
                        menu={<TradingViews.chart.menu />}
                      >
                        <ErrorBoundary feature="chart">
                          <TradingViews.chart.component marketId={market.id} />
                        </ErrorBoundary>
                      </Tab>
                      <Tab id="depth" name={t('Depth')}>
                        <ErrorBoundary feature="depth">
                          <TradingViews.depth.component marketId={market.id} />
                        </ErrorBoundary>
                      </Tab>
                      <Tab id="liquidity" name={t('Liquidity')}>
                        <ErrorBoundary feature="liquidity">
                          <TradingViews.liquidity.component
                            marketId={market.id}
                          />
                        </ErrorBoundary>
                      </Tab>
                      {market &&
                      market.tradableInstrument.instrument.product
                        .__typename === 'Perpetual' ? (
                        <Tab id="funding-history" name={t('Funding history')}>
                          <ErrorBoundary feature="funding-history">
                            <TradingViews.funding.component
                              marketId={market.id}
                            />
                          </ErrorBoundary>
                        </Tab>
                      ) : null}
                    </Tabs>
                  </TradeGridChild>
                </ResizableGridPanel>
                <ResizableGridPanel
                  minSize={200}
                  preferredSize={innerRowSizes[1] || 275}
                >
                  <TradeGridChild>
                    <Tabs storageKey="console-trade-grid-main-right">
                      <Tab id="orderbook" name={t('Orderbook')}>
                        <ErrorBoundary feature="orderbook">
                          <TradingViews.orderbook.component
                            marketId={market.id}
                          />
                        </ErrorBoundary>
                      </Tab>
                      <Tab
                        id="trades"
                        name={t('Trades')}
                        settings={<TradingViews.trades.settings />}
                      >
                        <ErrorBoundary feature="trades">
                          <TradingViews.trades.component marketId={market.id} />
                        </ErrorBoundary>
                      </Tab>
                    </Tabs>
                  </TradeGridChild>
                </ResizableGridPanel>
              </ResizableGrid>
            </ResizableGridPanel>
            <ResizableGridPanel
              preferredSize={verticalSizes[1] || '25%'}
              minSize={50}
              priority={LayoutPriority.Low}
            >
              <TradeGridChild>
                <Tabs storageKey="console-trade-grid-bottom">
                  <Tab
                    id="positions"
                    name={t('Positions')}
                    menu={<TradingViews.positions.menu />}
                    settings={<TradingViews.positions.settings />}
                  >
                    <ErrorBoundary feature="positions">
                      <TradingViews.positions.component />
                    </ErrorBoundary>
                  </Tab>
                  <Tab
                    id="open-orders"
                    name={t('Open')}
                    menu={
                      <TradingViews.activeOrders.menu marketId={market.id} />
                    }
                    settings={<TradingViews.activeOrders.settings />}
                  >
                    <ErrorBoundary feature="activeOrders">
                      <TradingViews.activeOrders.component
                        marketId={market.id}
                      />
                    </ErrorBoundary>
                  </Tab>
                  <Tab
                    id="inactive-orders"
                    name={t('Order history')}
                    menu={
                      <TradingViews.inactiveOrders.menu marketId={market.id} />
                    }
                    settings={<TradingViews.inactiveOrders.settings />}
                  >
                    <ErrorBoundary feature="inactiveOrders">
                      <TradingViews.inactiveOrders.component
                        marketId={market.id}
                      />
                    </ErrorBoundary>
                  </Tab>
                  {featureFlags.STOP_ORDERS ? (
                    <Tab
                      id="stop-orders"
                      name={t('Advanced orders')}
                      settings={<TradingViews.stopOrders.settings />}
                      menu={<TradingViews.stopOrders.menu />}
                    >
                      <ErrorBoundary feature="stop-orders">
                        <TradingViews.stopOrders.component
                          marketId={market.id}
                        />
                      </ErrorBoundary>
                    </Tab>
                  ) : null}
                  <Tab
                    id="fills"
                    name={t('Trades')}
                    settings={<TradingViews.fills.settings />}
                    menu={<TradingViews.fills.menu />}
                  >
                    <TradingViews.fills.component marketId={market.id} />
                  </Tab>
                  {market &&
                  market.tradableInstrument.instrument.product.__typename ===
                    'Perpetual' ? (
                    <Tab
                      id="funding-payments"
                      name={t('Funding payments')}
                      settings={<TradingViews.fundingPayments.settings />}
                      menu={<TradingViews.fundingPayments.menu />}
                    >
                      <ErrorBoundary feature="funding-payments">
                        <TradingViews.fundingPayments.component
                          marketId={market.id}
                        />
                      </ErrorBoundary>
                    </Tab>
                  ) : null}
                </Tabs>
              </TradeGridChild>
            </ResizableGridPanel>
          </ResizableGrid>
        </ResizableGridPanel>
        <ResizableGridPanel
          minSize={340}
          maxSize={600}
          preferredSize={rowSizes[1] || 340}
        >
          <TradeGridChild>
            <Sidebar pinnedAssets={pinnedAssets} />
          </TradeGridChild>
        </ResizableGridPanel>
      </ResizableGrid>
    );
  }
);
MainGrid.displayName = 'MainGrid';

export const TradeGrid = ({ market, pinnedAssets }: TradeGridProps) => {
  return (
    <div className="h-full grid grid-rows-[min-content_1fr]">
      <div>
        <MarketBanner market={market} />
      </div>
      <div className="min-h-0 -mx-1 my-1">
        <MainGrid market={market} pinnedAssets={pinnedAssets} />
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
      <div className="h-full bg-vega-clight-800 dark:bg-vega-cdark-800">
        {children}
      </div>
    </section>
  );
};
