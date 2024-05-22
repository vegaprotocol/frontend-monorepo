import { DepthChartContainer } from '../../components/depth-chart-container';
import { Filter, OpenOrdersMenu } from '@vegaprotocol/orders';
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
import { AccountsContainer } from '../../components/accounts-container';
import { LiquidityContainer } from '../../components/liquidity-container';
import { FundingContainer } from '../../components/funding-container';
import {
  FundingPaymentsContainer,
  FundingPaymentsSettings,
} from '../../components/funding-payments-container';
import {
  OrdersContainer,
  OrdersSettings,
} from '../../components/orders-container';
import {
  StopOrdersContainer,
  StopOrdersSettings,
} from '../../components/stop-orders-container';
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
    settings: FundingPaymentsSettings,
  },
  orderbook: {
    component: OrderbookContainer,
  },
  trades: {
    component: TradesContainer,
    settings: TradesSettings,
  },
  positions: {
    component: PositionsContainer,
    menu: PositionsMenu,
    settings: PositionsSettings,
  },
  activeOrders: {
    component: () => <OrdersContainer filter={Filter.Open} />,
    menu: OpenOrdersMenu,
    settings: () => <OrdersSettings filter={Filter.Open} />,
  },
  inactiveOrders: {
    component: () => <OrdersContainer filter={Filter.Inactive} />,
    menu: OpenOrdersMenu,
    settings: () => <OrdersSettings filter={Filter.Inactive} />,
  },
  stopOrders: {
    component: StopOrdersContainer,
    settings: StopOrdersSettings,
  },
  assets: {
    component: AccountsContainer,
  },
  fills: { component: FillsContainer, settings: FillsSettings },
} as const;
