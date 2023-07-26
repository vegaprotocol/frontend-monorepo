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
import { useMarketClickHandler } from '../../lib/hooks/use-market-click-handler';
import { VegaWalletContainer } from '../../components/vega-wallet-container';
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
  onSelect: (marketId: string, metaKey?: boolean) => void;
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
    const onMarketClick = useMarketClickHandler(true);

    return (
      <ResizableGrid vertical onChange={handleOnLayoutChange}>
        <ResizableGridPanel minSize={75} priority={LayoutPriority.High}>
          <ResizableGrid
            proportionalLayout={false}
            minSize={200}
            onChange={handleOnMiddleLayoutChange}
          >
            <ResizableGridPanel
              priority={LayoutPriority.High}
              minSize={200}
              preferredSize={sizesMiddle[1] || '50%'}
            >
              <TradeGridChild>
                <Tabs storageKey="console-trade-grid-main-left">
                  <Tab id="chart" name={t('Chart')}>
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
              preferredSize={sizesMiddle[2] || 300}
              minSize={200}
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
          priority={LayoutPriority.Low}
          preferredSize={sizes[1] || '25%'}
          minSize={50}
        >
          <TradeGridChild>
            <Tabs storageKey="console-trade-grid-bottom">
              <Tab id="positions" name={t('Positions')}>
                <VegaWalletContainer>
                  <TradingViews.positions.component
                    onMarketClick={onMarketClick}
                  />
                </VegaWalletContainer>
              </Tab>
              <Tab id="open-orders" name={t('Open')}>
                <VegaWalletContainer>
                  <TradingViews.orders.component
                    marketId={marketId}
                    filter={Filter.Open}
                  />
                </VegaWalletContainer>
              </Tab>
              <Tab id="closed-orders" name={t('Closed')}>
                <VegaWalletContainer>
                  <TradingViews.orders.component
                    marketId={marketId}
                    filter={Filter.Closed}
                  />
                </VegaWalletContainer>
              </Tab>
              <Tab id="rejected-orders" name={t('Rejected')}>
                <VegaWalletContainer>
                  <TradingViews.orders.component
                    marketId={marketId}
                    filter={Filter.Rejected}
                  />
                </VegaWalletContainer>
              </Tab>
              <Tab id="orders" name={t('All')}>
                <VegaWalletContainer>
                  <TradingViews.orders.component marketId={marketId} />
                </VegaWalletContainer>
              </Tab>
              <Tab id="fills" name={t('Fills')}>
                <VegaWalletContainer>
                  <TradingViews.fills.component
                    marketId={marketId}
                    onMarketClick={onMarketClick}
                  />
                </VegaWalletContainer>
              </Tab>
              <Tab id="accounts" name={t('Collateral')}>
                <VegaWalletContainer>
                  <TradingViews.collateral.component
                    pinnedAsset={pinnedAsset}
                    onMarketClick={onMarketClick}
                    hideButtons
                  />
                </VegaWalletContainer>
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
        {FLAGS.SUCCESSOR_MARKETS && <MarketSuccessorBanner market={market} />}
        {FLAGS.SUCCESSOR_MARKETS && (
          <MarketSuccessorProposalBanner marketId={market.id} />
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
            className="border border-default rounded-sm"
          >
            {children}
          </div>
        )}
      </AutoSizer>
    </section>
  );
};
