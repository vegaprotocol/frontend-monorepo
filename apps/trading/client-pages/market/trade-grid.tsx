import { memo, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutPriority } from 'allotment';
import classNames from 'classnames';
import AutoSizer from 'react-virtualized-auto-sizer';
import type { PinnedAsset } from '@vegaprotocol/accounts';
import { t } from '@vegaprotocol/i18n';
import { OracleBanner } from '@vegaprotocol/markets';
import type { Market } from '@vegaprotocol/markets';
import { Filter } from '@vegaprotocol/orders';
import {
  usePaneLayout,
  useScreenDimensions,
} from '@vegaprotocol/react-helpers';
import {
  Tab,
  LocalStoragePersistTabs as Tabs,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import {
  useMarketClickHandler,
  useMarketLiquidityClickHandler,
} from '../../lib/hooks/use-market-click-handler';
import { VegaWalletContainer } from '../../components/vega-wallet-container';
import { HeaderTitle } from '../../components/header';
import {
  ResizableGrid,
  ResizableGridPanel,
} from '../../components/resizable-grid';
import { TradingViews } from './trade-views';
import { MarketSelector } from './market-selector';
import { HeaderStats } from './header-stats';

interface TradeGridProps {
  market: Market | null;
  onSelect: (marketId: string, metaKey?: boolean) => void;
  pinnedAsset?: PinnedAsset;
}

interface BottomPanelProps {
  marketId: string;
  pinnedAsset?: PinnedAsset;
}

const MarketBottomPanel = memo(
  ({ marketId, pinnedAsset }: BottomPanelProps) => {
    const [sizes, handleOnLayoutChange] = usePaneLayout({ id: 'bottom' });
    const { screenSize } = useScreenDimensions();
    const onMarketClick = useMarketClickHandler(true);
    const onOrderTypeClick = useMarketLiquidityClickHandler(true);

    return 'xxxl' === screenSize ? (
      <ResizableGrid
        proportionalLayout
        minSize={200}
        onChange={handleOnLayoutChange}
      >
        <ResizableGridPanel
          priority={LayoutPriority.Low}
          preferredSize={sizes[0] || '50%'}
          minSize={50}
        >
          <TradeGridChild>
            <Tabs storageKey="console-trade-grid-bottom-left">
              <Tab id="open-orders" name={t('Open')}>
                <VegaWalletContainer>
                  <TradingViews.orders.component
                    marketId={marketId}
                    filter={Filter.Open}
                    onMarketClick={onMarketClick}
                    onOrderTypeClick={onOrderTypeClick}
                    enforceBottomPlaceholder
                    storeKey="marketOpenOrders"
                  />
                </VegaWalletContainer>
              </Tab>
              <Tab id="closed-orders" name={t('Closed')}>
                <VegaWalletContainer>
                  <TradingViews.orders.component
                    marketId={marketId}
                    filter={Filter.Closed}
                    onMarketClick={onMarketClick}
                    onOrderTypeClick={onOrderTypeClick}
                    enforceBottomPlaceholder
                    storeKey="marketClosedOrders"
                  />
                </VegaWalletContainer>
              </Tab>
              <Tab id="rejected-orders" name={t('Rejected')}>
                <VegaWalletContainer>
                  <TradingViews.orders.component
                    marketId={marketId}
                    filter={Filter.Rejected}
                    onMarketClick={onMarketClick}
                    onOrderTypeClick={onOrderTypeClick}
                    enforceBottomPlaceholder
                    storeKey="marketRejectOrders"
                  />
                </VegaWalletContainer>
              </Tab>
              <Tab id="orders" name={t('All')}>
                <VegaWalletContainer>
                  <TradingViews.orders.component
                    marketId={marketId}
                    onMarketClick={onMarketClick}
                    onOrderTypeClick={onOrderTypeClick}
                    enforceBottomPlaceholder
                    storeKey="marketAllOrders"
                  />
                </VegaWalletContainer>
              </Tab>
              <Tab id="fills" name={t('Fills')}>
                <VegaWalletContainer>
                  <TradingViews.fills.component
                    marketId={marketId}
                    onMarketClick={onMarketClick}
                    storeKey="marketFills"
                  />
                </VegaWalletContainer>
              </Tab>
            </Tabs>
          </TradeGridChild>
        </ResizableGridPanel>
        <ResizableGridPanel
          priority={LayoutPriority.Low}
          preferredSize={sizes[1] || '50%'}
          minSize={50}
        >
          <TradeGridChild>
            <Tabs storageKey="console-trade-grid-bottom-right">
              <Tab id="positions" name={t('Positions')}>
                <VegaWalletContainer>
                  <TradingViews.positions.component
                    onMarketClick={onMarketClick}
                    noBottomPlaceholder
                    storeKey="marketPositions"
                  />
                </VegaWalletContainer>
              </Tab>
              <Tab id="accounts" name={t('Collateral')}>
                <VegaWalletContainer>
                  <TradingViews.collateral.component
                    pinnedAsset={pinnedAsset}
                    onMarketClick={onMarketClick}
                    noBottomPlaceholder
                    hideButtons
                    storeKey="marketCollateral"
                  />
                </VegaWalletContainer>
              </Tab>
            </Tabs>
          </TradeGridChild>
        </ResizableGridPanel>
      </ResizableGrid>
    ) : (
      <TradeGridChild>
        <Tabs storageKey="console-trade-grid-bottom">
          <Tab id="positions" name={t('Positions')}>
            <VegaWalletContainer>
              <TradingViews.positions.component
                onMarketClick={onMarketClick}
                storeKey="marketPositions"
              />
            </VegaWalletContainer>
          </Tab>
          <Tab id="open-orders" name={t('Open')}>
            <VegaWalletContainer>
              <TradingViews.orders.component
                marketId={marketId}
                filter={Filter.Open}
                onMarketClick={onMarketClick}
                onOrderTypeClick={onOrderTypeClick}
                enforceBottomPlaceholder
                storeKey="marketOpenOrders"
              />
            </VegaWalletContainer>
          </Tab>
          <Tab id="closed-orders" name={t('Closed')}>
            <VegaWalletContainer>
              <TradingViews.orders.component
                marketId={marketId}
                filter={Filter.Closed}
                onMarketClick={onMarketClick}
                onOrderTypeClick={onOrderTypeClick}
                enforceBottomPlaceholder
                storeKey="marketClosedOrders"
              />
            </VegaWalletContainer>
          </Tab>
          <Tab id="rejected-orders" name={t('Rejected')}>
            <VegaWalletContainer>
              <TradingViews.orders.component
                marketId={marketId}
                filter={Filter.Rejected}
                onMarketClick={onMarketClick}
                onOrderTypeClick={onOrderTypeClick}
                enforceBottomPlaceholder
                storeKey="marketRejectedOrders"
              />
            </VegaWalletContainer>
          </Tab>
          <Tab id="orders" name={t('All')}>
            <VegaWalletContainer>
              <TradingViews.orders.component
                marketId={marketId}
                onMarketClick={onMarketClick}
                onOrderTypeClick={onOrderTypeClick}
                enforceBottomPlaceholder
                storeKey="marketAllOrders"
              />
            </VegaWalletContainer>
          </Tab>
          <Tab id="fills" name={t('Fills')}>
            <VegaWalletContainer>
              <TradingViews.fills.component
                marketId={marketId}
                onMarketClick={onMarketClick}
                storeKey="marketFills"
              />
            </VegaWalletContainer>
          </Tab>
          <Tab id="accounts" name={t('Collateral')}>
            <VegaWalletContainer>
              <TradingViews.collateral.component
                pinnedAsset={pinnedAsset}
                onMarketClick={onMarketClick}
                hideButtons
                storeKey="marketCollateral"
              />
            </VegaWalletContainer>
          </Tab>
        </Tabs>
      </TradeGridChild>
    );
  }
);
MarketBottomPanel.displayName = 'MarketBottomPanel';

const MainGrid = memo(
  ({
    marketId,
    pinnedAsset,
  }: {
    marketId: string;
    pinnedAsset?: PinnedAsset;
  }) => {
    const navigate = useNavigate();
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
              preferredSize={sizesMiddle[0] || 330}
              minSize={300}
            >
              <TradeGridChild>
                <Tabs storageKey="console-trade-grid-main-center">
                  <Tab id="ticket" name={t('Ticket')}>
                    <TradingViews.ticket.component
                      marketId={marketId}
                      onMarketClick={onMarketClick}
                      onClickCollateral={() => navigate('/portfolio')}
                    />
                  </Tab>
                  <Tab id="info" name={t('Info')}>
                    <TradingViews.info.component marketId={marketId} />
                  </Tab>
                </Tabs>
              </TradeGridChild>
            </ResizableGridPanel>
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
          <MarketBottomPanel marketId={marketId} pinnedAsset={pinnedAsset} />
        </ResizableGridPanel>
      </ResizableGrid>
    );
  }
);
MainGrid.displayName = 'MainGrid';

export const TradeGrid = ({ market, pinnedAsset }: TradeGridProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const wrapperClasses = classNames(
    'h-full grid',
    'grid-rows-[min-content_min-content_1fr]',
    'grid-cols-[320px_1fr]'
  );
  const paneWrapperClasses = classNames('min-h-0', {
    'col-span-2 col-start-1': !sidebarOpen,
  });

  return (
    <div className={wrapperClasses}>
      <div className="border-b border-r border-default">
        <div className="h-full flex gap-2 justify-between items-end px-4 pt-1 pb-3">
          <HeaderTitle
            primaryContent={market?.tradableInstrument.instrument.code}
            secondaryContent={market?.tradableInstrument.instrument.name}
          />
          <button
            onClick={() => setSidebarOpen((x) => !x)}
            className="flex flex-col items-center text-xs w-12"
            data-testid="sidebar-toggle"
          >
            {sidebarOpen ? (
              <>
                <VegaIcon name={VegaIconNames.CHEVRON_UP} />
                <span className="text-vega-light-300 dark:text-vega-dark-300">
                  {t('Close')}
                </span>
              </>
            ) : (
              <>
                <VegaIcon name={VegaIconNames.CHEVRON_DOWN} />
                <span className="text-vega-light-300 dark:text-vega-dark-300">
                  {t('Markets')}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
      <div className="border-b border-default min-w-0">
        <HeaderStats market={market} />
      </div>
      <div className="col-span-2 bg-vega-green">
        <OracleBanner marketId={market?.id || ''} />
      </div>
      {sidebarOpen && (
        <div className="border-r border-default min-h-0">
          <div className="h-full pb-8">
            <MarketSelector currentMarketId={market?.id} />
          </div>
        </div>
      )}
      <div className={paneWrapperClasses}>
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
    <section className="h-full">
      <AutoSizer>
        {({ width, height }) => <div style={{ width, height }}>{children}</div>}
      </AutoSizer>
    </section>
  );
};
