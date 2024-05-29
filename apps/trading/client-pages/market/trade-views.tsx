import { DepthChartContainer } from '../../components/depth-chart-container';
import { Filter } from '@vegaprotocol/orders';
import {
  TradesContainer,
  TradesSettings,
} from '../../components/trades-container';
import { OrderbookContainer } from '../../components/orderbook-container';
import {
  FillsContainer,
  FillsSettings,
} from '../../components/fills-container';
import {
  PositionsContainer,
  PositionsSettings,
} from '../../components/positions-container';
import {
  AccountsContainer,
  AccountsSettings,
} from '../../components/accounts-container';
import { LiquidityContainer } from '../../components/liquidity-container';
import { FundingContainer } from '../../components/funding-container';
import {
  FundingPaymentsContainer,
  FundingPaymentsSettings,
} from '../../components/funding-payments-container';
import {
  OrdersContainer,
  OrdersSettings,
  ShowCurrentMarketOnly,
} from '../../components/orders-container';
import {
  StopOrdersContainer,
  StopOrdersSettings,
} from '../../components/stop-orders-container';
import { AccountsMenu } from '../../components/accounts-menu';
import { PositionsMenu } from '../../components/positions-menu';
import { ChartContainer, ChartMenu } from '../../components/chart-container';
import { OpenOrdersMenu } from '../../components/open-orders-menu';

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
    settings: FundingPaymentsSettings,
    menu: ShowCurrentMarketOnly,
  },
  orderbook: {
    component: OrderbookContainer,
  },
  trades: {
    component: TradesContainer,
    settings: TradesSettings,
    menu: ShowCurrentMarketOnly,
  },
  positions: {
    component: PositionsContainer,
    menu: PositionsMenu,
    settings: PositionsSettings,
  },
  activeOrders: {
    component: (props: { marketId: string }) => (
      <OrdersContainer filter={Filter.Open} {...props} />
    ),
    menu: OpenOrdersMenu,
    settings: () => <OrdersSettings filter={Filter.Open} />,
  },
  inactiveOrders: {
    component: (props: { marketId: string }) => (
      <OrdersContainer filter={Filter.Inactive} {...props} />
    ),
    menu: OpenOrdersMenu,
    settings: () => <OrdersSettings filter={Filter.Inactive} />,
  },
  stopOrders: {
    component: StopOrdersContainer,
    settings: StopOrdersSettings,
    menu: ShowCurrentMarketOnly,
  },
  collateral: {
    component: AccountsContainer,
    menu: AccountsMenu,
    settings: AccountsSettings,
  },
  fills: {
    component: FillsContainer,
    settings: FillsSettings,
    menu: ShowCurrentMarketOnly,
  },
} as const;
