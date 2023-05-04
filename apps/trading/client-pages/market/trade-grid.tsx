import { DealTicketContainer } from '@vegaprotocol/deal-ticket';
import { MarketInfoAccordionContainer } from '@vegaprotocol/market-info';
import { OrderbookContainer } from '@vegaprotocol/market-depth';
import { OrderListContainer, Filter } from '@vegaprotocol/orders';
import type { OrderListContainerProps } from '@vegaprotocol/orders';
import { FillsContainer } from '@vegaprotocol/fills';
import { PositionsContainer } from '@vegaprotocol/positions';
import { TradesContainer } from '@vegaprotocol/trades';
import { LayoutPriority } from 'allotment';
import classNames from 'classnames';
import AutoSizer from 'react-virtualized-auto-sizer';
import { memo, useState } from 'react';
import type { ReactNode, ComponentProps } from 'react';
import { DepthChartContainer } from '@vegaprotocol/market-depth';
import { CandlesChartContainer } from '@vegaprotocol/candles-chart';
import { OracleBanner } from '../../components/banner';
import {
  Tab,
  LocalStoragePersistTabs as Tabs,
  Splash,
} from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/i18n';
import { AccountsContainer } from '../../components/accounts-container';
import type { Market } from '@vegaprotocol/market-list';
import { VegaWalletContainer } from '../../components/vega-wallet-container';
import { TradeMarketHeader } from './trade-market-header';
import { NO_MARKET } from './constants';
import { LiquidityContainer } from '../liquidity/liquidity';
import { useNavigate } from 'react-router-dom';
import type { PinnedAsset } from '@vegaprotocol/accounts';
import {
  usePaneLayout,
  useScreenDimensions,
} from '@vegaprotocol/react-helpers';
import {
  useMarketClickHandler,
  useMarketLiquidityClickHandler,
} from '../../lib/hooks/use-market-click-handler';
import {
  ResizableGrid,
  ResizableGridPanel,
} from '../../components/resizable-grid';

type MarketDependantView =
  | typeof CandlesChartContainer
  | typeof DepthChartContainer
  | typeof DealTicketContainer
  | typeof MarketInfoAccordionContainer
  | typeof OrderbookContainer
  | typeof TradesContainer;

type MarketDependantViewProps = ComponentProps<MarketDependantView>;

const requiresMarket = (View: MarketDependantView) => {
  const WrappedComponent = (props: MarketDependantViewProps) =>
    props.marketId ? <View {...props} /> : <Splash>{NO_MARKET}</Splash>;
  WrappedComponent.displayName = `RequiresMarket(${View.name})`;
  return WrappedComponent;
};

const TradingViews = {
  candles: {
    label: 'Candles',
    component: requiresMarket(CandlesChartContainer),
  },
  depth: {
    label: 'Depth',
    component: requiresMarket(DepthChartContainer),
  },
  liquidity: {
    label: 'Liquidity',
    component: requiresMarket(LiquidityContainer),
  },
  ticket: {
    label: 'Ticket',
    component: requiresMarket(DealTicketContainer),
  },
  info: {
    label: 'Info',
    component: requiresMarket(MarketInfoAccordionContainer),
  },
  orderbook: {
    label: 'Orderbook',
    component: requiresMarket(OrderbookContainer),
  },
  trades: {
    label: 'Trades',
    component: requiresMarket(TradesContainer),
  },
  positions: { label: 'Positions', component: PositionsContainer },
  activeOrders: {
    label: 'Active',
    component: (props: OrderListContainerProps) => (
      <OrderListContainer {...props} filter={Filter.Open} />
    ),
  },
  closedOrders: {
    label: 'Closed',
    component: (props: OrderListContainerProps) => (
      <OrderListContainer {...props} filter={Filter.Closed} />
    ),
  },
  rejectedOrders: {
    label: 'Rejected',
    component: (props: OrderListContainerProps) => (
      <OrderListContainer {...props} filter={Filter.Rejected} />
    ),
  },
  orders: {
    label: 'All',
    component: OrderListContainer,
  },
  collateral: { label: 'Collateral', component: AccountsContainer },
  fills: { label: 'Fills', component: FillsContainer },
};

type TradingView = keyof typeof TradingViews;

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
                  />
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
                  />
                </VegaWalletContainer>
              </Tab>
              <Tab id="accounts" name={t('Collateral')}>
                <VegaWalletContainer>
                  <TradingViews.collateral.component
                    pinnedAsset={pinnedAsset}
                    noBottomPlaceholder
                    hideButtons
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
              <TradingViews.positions.component onMarketClick={onMarketClick} />
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
              />
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
                hideButtons
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
      id: 'middle',
    });

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
              preferredSize={sizesMiddle[0] || '50%'}
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
              priority={LayoutPriority.Low}
              preferredSize={sizesMiddle[1] || 330}
              minSize={300}
            >
              <TradeGridChild>
                <Tabs storageKey="console-trade-grid-main-center">
                  <Tab id="ticket" name={t('Ticket')}>
                    <TradingViews.ticket.component
                      marketId={marketId}
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
              priority={LayoutPriority.Low}
              preferredSize={sizesMiddle[2] || 430}
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

export const TradeGrid = ({
  market,
  onSelect,
  pinnedAsset,
}: TradeGridProps) => {
  return (
    <div className="h-full grid grid-rows-[min-content_1fr]">
      <div>
        <TradeMarketHeader market={market} onSelect={onSelect} />
        <OracleBanner marketId={market?.id || ''} />
      </div>
      <MainGrid marketId={market?.id || ''} pinnedAsset={pinnedAsset} />
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
