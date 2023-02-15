import { DealTicketContainer } from '@vegaprotocol/deal-ticket';
import { MarketInfoContainer } from '@vegaprotocol/market-info';
import { OrderbookContainer } from '@vegaprotocol/market-depth';
import { OrderListContainer } from '@vegaprotocol/orders';
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
import {
  Tab,
  Tabs,
  ResizableGrid,
  ResizableGridPanel,
  Splash,
} from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/react-helpers';
import { AccountsContainer } from '../../components/accounts-container';
import type { Market } from '@vegaprotocol/market-list';
import { VegaWalletContainer } from '../../components/vega-wallet-container';
import { TradeMarketHeader } from './trade-market-header';
import { NO_MARKET } from './constants';
import { LiquidityContainer } from '../liquidity/liquidity';
import { useNavigate } from 'react-router-dom';
import { Links, Routes } from '../../pages/client-router';
import type { Asset } from '@vegaprotocol/types';

type MarketDependantView =
  | typeof CandlesChartContainer
  | typeof DepthChartContainer
  | typeof DealTicketContainer
  | typeof MarketInfoContainer
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
  Candles: requiresMarket(CandlesChartContainer),
  Depth: requiresMarket(DepthChartContainer),
  Liquidity: requiresMarket(LiquidityContainer),
  Ticket: requiresMarket(DealTicketContainer),
  Info: requiresMarket(MarketInfoContainer),
  Orderbook: requiresMarket(OrderbookContainer),
  Trades: requiresMarket(TradesContainer),
  Positions: PositionsContainer,
  Orders: OrderListContainer,
  Collateral: AccountsContainer,
  Fills: FillsContainer,
};

type TradingView = keyof typeof TradingViews;

interface TradeGridProps {
  market: Market | null;
  onSelect: (marketId: string) => void;
  marketAsset?: Asset;
}

const MainGrid = ({
  marketId,
  onSelect,
  marketAsset,
}: {
  marketId: string;
  onSelect?: (marketId: string) => void;
  marketAsset?: Asset;
}) => {
  const navigate = useNavigate();
  const onMarketClick = (marketId: string) => {
    navigate(Links[Routes.MARKET](marketId), {
      replace: true,
    });
  };
  return (
    <ResizableGrid vertical>
      <ResizableGridPanel minSize={75} priority={LayoutPriority.High}>
        <ResizableGrid proportionalLayout={false} minSize={200}>
          <ResizableGridPanel
            priority={LayoutPriority.High}
            minSize={200}
            preferredSize="50%"
          >
            <TradeGridChild>
              <Tabs>
                <Tab id="chart" name={t('Chart')}>
                  <TradingViews.Candles marketId={marketId} />
                </Tab>
                <Tab id="depth" name={t('Depth')}>
                  <TradingViews.Depth marketId={marketId} />
                </Tab>
                <Tab id="liquidity" name={t('Liquidity')}>
                  <TradingViews.Liquidity marketId={marketId} />
                </Tab>
              </Tabs>
            </TradeGridChild>
          </ResizableGridPanel>
          <ResizableGridPanel
            priority={LayoutPriority.Low}
            preferredSize={330}
            minSize={300}
          >
            <TradeGridChild>
              <Tabs>
                <Tab id="ticket" name={t('Ticket')}>
                  <TradingViews.Ticket
                    marketId={marketId}
                    onClickCollateral={() => navigate('/portfolio')}
                  />
                </Tab>
                <Tab id="info" name={t('Info')}>
                  <TradingViews.Info
                    marketId={marketId}
                    onSelect={(id: string) => {
                      onSelect?.(id);
                    }}
                  />
                </Tab>
              </Tabs>
            </TradeGridChild>
          </ResizableGridPanel>
          <ResizableGridPanel
            priority={LayoutPriority.Low}
            preferredSize={430}
            minSize={200}
          >
            <TradeGridChild>
              <Tabs>
                <Tab id="orderbook" name={t('Orderbook')}>
                  <TradingViews.Orderbook marketId={marketId} />
                </Tab>
                <Tab id="trades" name={t('Trades')}>
                  <TradingViews.Trades marketId={marketId} />
                </Tab>
              </Tabs>
            </TradeGridChild>
          </ResizableGridPanel>
        </ResizableGrid>
      </ResizableGridPanel>
      <ResizableGridPanel
        priority={LayoutPriority.Low}
        preferredSize="25%"
        minSize={50}
      >
        <TradeGridChild>
          <Tabs>
            <Tab id="positions" name={t('Positions')}>
              <VegaWalletContainer>
                <TradingViews.Positions onMarketClick={onMarketClick} />
              </VegaWalletContainer>
            </Tab>
            <Tab id="orders" name={t('Orders')}>
              <VegaWalletContainer>
                <TradingViews.Orders
                  marketId={marketId}
                  onMarketClick={onMarketClick}
                />
              </VegaWalletContainer>
            </Tab>
            <Tab id="fills" name={t('Fills')}>
              <VegaWalletContainer>
                <TradingViews.Fills
                  marketId={marketId}
                  onMarketClick={onMarketClick}
                />
              </VegaWalletContainer>
            </Tab>
            <Tab id="accounts" name={t('Collateral')}>
              <VegaWalletContainer>
                <TradingViews.Collateral marketAsset={marketAsset} />
              </VegaWalletContainer>
            </Tab>
          </Tabs>
        </TradeGridChild>
      </ResizableGridPanel>
    </ResizableGrid>
  );
};
const MainGridWrapped = memo(MainGrid);

export const TradeGrid = ({
  market,
  onSelect,
  marketAsset,
}: TradeGridProps) => {
  return (
    <div className="h-full grid grid-rows-[min-content_1fr]">
      <TradeMarketHeader market={market} onSelect={onSelect} />
      <MainGridWrapped
        marketId={market?.id || ''}
        onSelect={onSelect}
        marketAsset={marketAsset}
      />
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
  onSelect: (marketId: string) => void;
  onMarketClick?: (marketId: string) => void;
  onClickCollateral: () => void;
  marketAsset?: Asset;
}

export const TradePanels = ({
  market,
  onSelect,
  onClickCollateral,
  marketAsset,
}: TradePanelsProps) => {
  const [view, setView] = useState<TradingView>('Candles');
  const renderView = () => {
    const Component = memo<{
      marketId: string;
      onSelect: (marketId: string) => void;
      onMarketClick?: (marketId: string) => void;
      onClickCollateral: () => void;
      marketAsset?: Asset;
    }>(TradingViews[view]);

    if (!Component) {
      throw new Error(`No component for view: ${view}`);
    }

    if (!market) return <Splash>{NO_MARKET}</Splash>;

    return (
      <Component
        marketId={market?.id}
        onSelect={onSelect}
        onClickCollateral={onClickCollateral}
        marketAsset={marketAsset}
      />
    );
  };

  return (
    <div className="h-full grid grid-rows-[min-content_1fr_min-content]">
      <TradeMarketHeader market={market} onSelect={onSelect} />
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
              {key}
            </button>
          );
        })}
      </div>
    </div>
  );
};
