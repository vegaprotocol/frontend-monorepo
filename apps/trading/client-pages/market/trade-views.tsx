import { DepthChartContainer } from '@vegaprotocol/market-depth';
import { Filter, OpenOrdersMenu } from '@vegaprotocol/orders';
import {
  TradesContainer,
  useTradesStore,
} from '../../components/trades-container';
import { OrderbookContainer } from '../../components/orderbook-container';
import {
  FillsContainer,
  useFillsStore,
} from '../../components/fills-container';
import {
  PositionsContainer,
  usePositionsStore,
} from '../../components/positions-container';
import {
  AccountsContainer,
  useAccountStore,
} from '../../components/accounts-container';
import { LiquidityContainer } from '../../components/liquidity-container';
import { FundingContainer } from '../../components/funding-container';
import {
  FundingPaymentsContainer,
  useFundingPaymentsStore,
} from '../../components/funding-payments-container';
import {
  OrdersContainer,
  useOrderListStore,
} from '../../components/orders-container';
import {
  StopOrdersContainer,
  useStopOrdersStore,
} from '../../components/stop-orders-container';
import { AccountsMenu } from '../../components/accounts-menu';
import { PositionsMenu } from '../../components/positions-menu';
import { ChartContainer, ChartMenu } from '../../components/chart-container';
import { DataGridStore } from '../../stores/datagrid-store-slice';
import { TradingButton as Button } from '@vegaprotocol/ui-toolkit';

export type TradingView = keyof typeof TradingViews;

const GridSettings = ({
  updateGridStore,
}: {
  updateGridStore: (gridStore: DataGridStore) => void;
}) => (
  <Button
    onClick={() =>
      updateGridStore({
        columnState: undefined,
        filterModel: undefined,
      })
    }
    size="extra-small"
  >
    reset
  </Button>
);

const FundingPaymentsSettings = () => (
  <GridSettings
    updateGridStore={useFundingPaymentsStore((store) => store.updateGridStore)}
  />
);

const FillsSettings = () => (
  <GridSettings
    updateGridStore={useFillsStore((store) => store.updateGridStore)}
  />
);

const TradesSettings = () => (
  <GridSettings
    updateGridStore={useTradesStore((store) => store.updateGridStore)}
  />
);

const AccountsSettings = () => (
  <GridSettings
    updateGridStore={useAccountStore((store) => store.updateGridStore)}
  />
);

const PositionsSettings = () => (
  <GridSettings
    updateGridStore={usePositionsStore((store) => store.updateGridStore)}
  />
);

const OrdersSettings = ({ filter }: { filter?: Filter }) => {
  const updateGridState = useOrderListStore((state) => state.update);
  return (
    <GridSettings
      updateGridStore={(gridStore: DataGridStore) =>
        updateGridState(filter, gridStore)
      }
    />
  );
};

const StopOrdersSettings = () => (
  <GridSettings
    updateGridStore={useStopOrdersStore((store) => store.updateGridStore)}
  />
);

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
  closedOrders: {
    component: () => <OrdersContainer filter={Filter.Closed} />,
    settings: () => <OrdersSettings filter={Filter.Closed} />,
  },
  rejectedOrders: {
    component: () => <OrdersContainer filter={Filter.Rejected} />,
    settings: () => <OrdersSettings filter={Filter.Rejected} />,
  },
  orders: {
    component: OrdersContainer,
    menu: OpenOrdersMenu,
    settings: OrdersSettings,
  },
  stopOrders: {
    component: StopOrdersContainer,
    settings: StopOrdersSettings,
  },
  collateral: {
    component: AccountsContainer,
    menu: AccountsMenu,
    settings: AccountsSettings,
  },
  fills: { component: FillsContainer, settings: FillsSettings },
} as const;
