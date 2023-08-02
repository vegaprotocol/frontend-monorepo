import type { ComponentProps } from 'react';
import { Splash } from '@vegaprotocol/ui-toolkit';
import { TradesContainer } from '@vegaprotocol/trades';
import { DepthChartContainer } from '@vegaprotocol/market-depth';
import {
  CandlesChartContainer,
  CandlesMenu,
} from '@vegaprotocol/candles-chart';
import { Filter } from '@vegaprotocol/orders';
import { NO_MARKET } from './constants';
import { OrderbookContainer } from '../../components/orderbook-container';
import { FillsContainer } from '../../components/fills-container';
import { PositionsContainer } from '../../components/positions-container';
import { AccountsContainer } from '../../components/accounts-container';
import { LiquidityContainer } from '../../components/liquidity-container';
import type { OrderContainerProps } from '../../components/orders-container';
import { OrdersContainer } from '../../components/orders-container';
import { StopOrdersContainer } from '../../components/stop-orders-container';

type MarketDependantView =
  | typeof CandlesChartContainer
  | typeof DepthChartContainer
  | typeof OrderbookContainer
  | typeof TradesContainer;

type MarketDependantViewProps = ComponentProps<MarketDependantView>;

const requiresMarket = (View: MarketDependantView) => {
  const WrappedComponent = (props: MarketDependantViewProps) =>
    props.marketId ? <View {...props} /> : <Splash>{NO_MARKET}</Splash>;
  WrappedComponent.displayName = `RequiresMarket(${View.name})`;
  return WrappedComponent;
};

export type TradingView = keyof typeof TradingViews;

export const TradingViews = {
  candles: {
    label: 'Candles',
    component: requiresMarket(CandlesChartContainer),
    menu: CandlesMenu,
  },
  depth: {
    label: 'Depth',
    component: requiresMarket(DepthChartContainer),
  },
  liquidity: {
    label: 'Liquidity',
    component: requiresMarket(LiquidityContainer),
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
    component: (props: OrderContainerProps) => (
      <OrdersContainer {...props} filter={Filter.Open} />
    ),
  },
  closedOrders: {
    label: 'Closed',
    component: (props: OrderContainerProps) => (
      <OrdersContainer {...props} filter={Filter.Closed} />
    ),
  },
  rejectedOrders: {
    label: 'Rejected',
    component: (props: OrderContainerProps) => (
      <OrdersContainer {...props} filter={Filter.Rejected} />
    ),
  },
  orders: {
    label: 'All',
    component: OrdersContainer,
  },
  stopOrders: {
    label: 'Stop',
    component: StopOrdersContainer,
  },
  collateral: { label: 'Collateral', component: AccountsContainer },
  fills: { label: 'Fills', component: FillsContainer },
};
