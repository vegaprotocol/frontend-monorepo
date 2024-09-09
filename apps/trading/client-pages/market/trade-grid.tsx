import { memo } from 'react';
import { LayoutPriority } from 'allotment';
import { type Market } from '@vegaprotocol/markets';
import { Tab, LocalStoragePersistTabs as Tabs } from '@vegaprotocol/ui-toolkit';
import {
  ResizableGrid,
  ResizableGridPanel,
  ResizableGridPanelChild,
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
    const t = useT();
    const [rowSizes, handleRowSizes] = usePaneLayout({
      id: 'trade-row',
    });
    const [innerRowSizes, handleInnerRowChange] = usePaneLayout({
      id: 'trade-inner-row',
    });
    const [verticalSizes, handleVerticalChange] = usePaneLayout({
      id: 'trade-col',
    });

    return (
      <ResizableGrid onChange={handleRowSizes}>
        <ResizableGridPanel preferredSize={rowSizes[0]}>
          <ResizableGrid vertical onChange={handleVerticalChange}>
            <ResizableGridPanel minSize={72} maxSize={72}>
              <ResizableGridPanelChild>
                <MarketHeader />
              </ResizableGridPanelChild>
            </ResizableGridPanel>
            <ResizableGridPanel
              // use verticalSizes[1] because the previous pane is for
              // the market header which is always fixed size
              preferredSize={verticalSizes[1]}
              priority={LayoutPriority.High}
              minSize={200}
            >
              <ResizableGrid onChange={handleInnerRowChange}>
                <ResizableGridPanel
                  priority={LayoutPriority.High}
                  minSize={200}
                  preferredSize={innerRowSizes[0] || '75%'}
                >
                  <ResizableGridPanelChild>
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
                  </ResizableGridPanelChild>
                </ResizableGridPanel>
                <ResizableGridPanel
                  minSize={200}
                  preferredSize={innerRowSizes[1] || 275}
                >
                  <ResizableGridPanelChild>
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
                  </ResizableGridPanelChild>
                </ResizableGridPanel>
              </ResizableGrid>
            </ResizableGridPanel>
            <ResizableGridPanel
              // use verticalSizes[2] because the first pane is for
              // the market header which is always fixed size
              preferredSize={verticalSizes[2] || '25%'}
              minSize={50}
              priority={LayoutPriority.Low}
            >
              <ResizableGridPanelChild>
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
                  <Tab
                    id="stop-orders"
                    name={t('Advanced orders')}
                    settings={<TradingViews.stopOrders.settings />}
                    menu={<TradingViews.stopOrders.menu />}
                  >
                    <ErrorBoundary feature="stop-orders">
                      <TradingViews.stopOrders.component marketId={market.id} />
                    </ErrorBoundary>
                  </Tab>
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
              </ResizableGridPanelChild>
            </ResizableGridPanel>
          </ResizableGrid>
        </ResizableGridPanel>
        <ResizableGridPanel
          minSize={350}
          maxSize={600}
          preferredSize={rowSizes[1] || 340}
        >
          <ResizableGridPanelChild className="bg-transparent">
            <Sidebar pinnedAssets={pinnedAssets} />
          </ResizableGridPanelChild>
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
      <div className="min-h-0 m-2">
        <MainGrid market={market} pinnedAssets={pinnedAssets} />
      </div>
    </div>
  );
};
