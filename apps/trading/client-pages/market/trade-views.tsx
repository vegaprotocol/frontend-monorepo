import { DealTicketContainer } from '@vegaprotocol/deal-ticket';
import { MarketInfoAccordionContainer } from '@vegaprotocol/markets';
import { OrderbookContainer } from '@vegaprotocol/market-depth';
import { OrderListContainer, Filter } from '@vegaprotocol/orders';
import type { OrderListContainerProps } from '@vegaprotocol/orders';
import { FillsContainer } from '@vegaprotocol/fills';
import { PositionsContainer } from '@vegaprotocol/positions';
import { TradesContainer } from '@vegaprotocol/trades';
import type { ComponentProps } from 'react';
import { DepthChartContainer } from '@vegaprotocol/market-depth';
import { CandlesChartContainer } from '@vegaprotocol/candles-chart';
import { Splash } from '@vegaprotocol/ui-toolkit';
import { AccountsContainer } from '../../components/accounts-container';
import { NO_MARKET } from './constants';
import { LiquidityContainer } from '../liquidity/liquidity';
import { OrdersContainer } from '../../components/orders-container';

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

export type TradingView = keyof typeof TradingViews;

export const TradingViews = {
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
    component: OrdersContainer,
  },
  collateral: { label: 'Collateral', component: AccountsContainer },
  fills: { label: 'Fills', component: FillsContainer },
};
