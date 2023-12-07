import { DepthChartContainer } from '@vegaprotocol/market-depth';
import { Filter, OpenOrdersMenu } from '@vegaprotocol/orders';
import { TradesContainer } from '../../components/trades-container';
import { OrderbookContainer } from '../../components/orderbook-container';
import { FillsContainer } from '../../components/fills-container';
import { PositionsContainer } from '../../components/positions-container';
import { AccountsContainer } from '../../components/accounts-container';
import { LiquidityContainer } from '../../components/liquidity-container';
import { FundingContainer } from '../../components/funding-container';
import { FundingPaymentsContainer } from '../../components/funding-payments-container';
import { OrdersContainer } from '../../components/orders-container';
import { StopOrdersContainer } from '../../components/stop-orders-container';
import { AccountsMenu } from '../../components/accounts-menu';
import { PositionsMenu } from '../../components/positions-menu';
import { ChartContainer, ChartMenu } from '../../components/chart-container';

export type TradingView = keyof typeof TradingViews;

export const TradingViews = {
  chart: {
    component: ChartContainer,
    menu: ChartMenu,
  },
  depth: {
    component: DepthChartContainer,
  },
  liquidity: {
    component: LiquidityContainer,
  },
  funding: {
    component: FundingContainer,
  },
  fundingPayments: {
    component: FundingPaymentsContainer,
  },
  orderbook: {
    component: OrderbookContainer,
  },
  trades: {
    component: TradesContainer,
  },
  positions: {
    component: PositionsContainer,
    menu: PositionsMenu,
  },
  activeOrders: {
    component: () => <OrdersContainer filter={Filter.Open} />,
    menu: OpenOrdersMenu,
  },
  closedOrders: {
    component: () => <OrdersContainer filter={Filter.Closed} />,
  },
  rejectedOrders: {
    component: () => <OrdersContainer filter={Filter.Rejected} />,
  },
  orders: {
    component: OrdersContainer,
    menu: OpenOrdersMenu,
  },
  stopOrders: {
    component: StopOrdersContainer,
  },
  collateral: {
    component: AccountsContainer,
    menu: AccountsMenu,
  },
  fills: { component: FillsContainer },
} as const;
