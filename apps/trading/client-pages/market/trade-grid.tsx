import { memo } from 'react';
import type { ReactNode } from 'react';
import { LayoutPriority } from 'allotment';
import classNames from 'classnames';
import AutoSizer from 'react-virtualized-auto-sizer';
import type { PinnedAsset } from '@vegaprotocol/accounts';
import { OracleBanner, useMarket } from '@vegaprotocol/markets';
import type { Market } from '@vegaprotocol/markets';
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
  MarketTerminationBanner,
} from '../../components/market-banner';
import { useFeatureFlags } from '@vegaprotocol/environment';
import { useT } from '../../lib/use-t';
import { ErrorBoundary } from '../../components/error-boundary';

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
    const featureFlags = useFeatureFlags((state) => state.flags);
    const t = useT();
    const { data: market } = useMarket(marketId);
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
                    <ErrorBoundary feature="chart">
                      <TradingViews.candles.component marketId={marketId} />
                    </ErrorBoundary>
                  </Tab>
                  <Tab id="depth" name={t('Depth')}>
                    <ErrorBoundary feature="depth">
                      <TradingViews.depth.component marketId={marketId} />
                    </ErrorBoundary>
                  </Tab>
                  <Tab id="liquidity" name={t('Liquidity')}>
                    <ErrorBoundary feature="liquidity">
                      <TradingViews.liquidity.component marketId={marketId} />
                    </ErrorBoundary>
                  </Tab>
                  {market &&
                  market.tradableInstrument.instrument.product.__typename ===
                    'Perpetual' ? (
                    <Tab id="funding-history" name={t('Funding history')}>
                      <ErrorBoundary feature="funding-history">
                        <TradingViews.funding.component marketId={marketId} />
                      </ErrorBoundary>
                    </Tab>
                  ) : null}
                  {market &&
                  market.tradableInstrument.instrument.product.__typename ===
                    'Perpetual' ? (
                    <Tab id="funding-payments" name={t('Funding payments')}>
                      <ErrorBoundary feature="funding-payments">
                        <TradingViews.fundingPayments.component
                          marketId={marketId}
                        />
                      </ErrorBoundary>
                    </Tab>
                  ) : null}
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
                    <ErrorBoundary feature="orderbook">
                      <TradingViews.orderbook.component marketId={marketId} />
                    </ErrorBoundary>
                  </Tab>
                  <Tab id="trades" name={t('Trades')}>
                    <ErrorBoundary feature="trades">
                      <TradingViews.trades.component marketId={marketId} />
                    </ErrorBoundary>
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
                <ErrorBoundary feature="positions">
                  <TradingViews.positions.component />
                </ErrorBoundary>
              </Tab>
              <Tab
                id="open-orders"
                name={t('Open')}
                menu={<TradingViews.activeOrders.menu />}
              >
                <ErrorBoundary feature="activeOrders">
                  <TradingViews.activeOrders.component />
                </ErrorBoundary>
              </Tab>
              <Tab id="closed-orders" name={t('Closed')}>
                <ErrorBoundary feature="closedOrders">
                  <TradingViews.closedOrders.component />
                </ErrorBoundary>
              </Tab>
              <Tab id="rejected-orders" name={t('Rejected')}>
                <ErrorBoundary feature="rejectedOrders">
                  <TradingViews.rejectedOrders.component />
                </ErrorBoundary>
              </Tab>
              <Tab
                id="orders"
                name={t('All')}
                menu={<TradingViews.orders.menu />}
              >
                <ErrorBoundary feature="orders">
                  <TradingViews.orders.component />
                </ErrorBoundary>
              </Tab>
              {featureFlags.STOP_ORDERS ? (
                <Tab id="stop-orders" name={t('Stop orders')}>
                  <ErrorBoundary feature="stop-orders">
                    <TradingViews.stopOrders.component />
                  </ErrorBoundary>
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
                <ErrorBoundary feature="collateral">
                  <TradingViews.collateral.component
                    pinnedAsset={pinnedAsset}
                  />
                </ErrorBoundary>
              </Tab>
            </Tabs>
          </TradeGridChild>
        </ResizableGridPanel>
      </ResizableGrid>
    );
  },
);
MainGrid.displayName = 'MainGrid';

export const TradeGrid = ({ market, pinnedAsset }: TradeGridProps) => {
  const featureFlags = useFeatureFlags((state) => state.flags);
  const wrapperClasses = classNames(
    'h-full grid',
    'grid-rows-[min-content_1fr]',
  );

  return (
    <div className={wrapperClasses}>
      <div>
        {featureFlags.SUCCESSOR_MARKETS && (
          <>
            <MarketSuccessorBanner market={market} />
            <MarketSuccessorProposalBanner marketId={market?.id} />
          </>
        )}
        <MarketTerminationBanner market={market} />
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
